import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { config } from './config';
import { issueJwt, verifyJwt } from './auth';
import { exchangeCodeForGoogleIdentity, verifyGoogleCredential } from './google';
import { initDb } from './db';
import { getUser, getUserByGoogleId, patchUser, upsertUser } from './store';
import { uploadToFirebaseStorage } from './storage';
import { AuthJwtPayload, UserDocument, UserProfile } from './types';
import { authGoogleSchema, onboardSchema, processVaultSchema, profilePatchSchema, uploadVaultSchema } from './validation';

async function runDocumentExtraction(dataUri: string, docType: string): Promise<Record<string, unknown>> {
  try {
    const ai = await import('./ai/flows/extract-data-from-document.js');
    const result = await ai.extractDataFromDocument({ dataUri, docType });
    return result.extractedData || {};
  } catch (error) {
    console.warn('AI extraction unavailable, storing fallback payload', error);
    return {
      warning: 'ai_unavailable',
      docType,
    };
  }
}

function resolveCorsOrigin(req: IncomingMessage): string | null {
  const origin = req.headers.origin;
  if (!origin) return config.corsOrigins[0] || null;
  if (config.corsOrigins.includes(origin)) return origin;
  return null;
}

function setCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const allowedOrigin = resolveCorsOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function setSecurityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none';"
  );
}

function sendJson(req: IncomingMessage, res: ServerResponse, status: number, body: unknown): void {
  setCorsHeaders(req, res);
  setSecurityHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function logInfo(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.log(`[INFO] ${message}`, meta);
    return;
  }
  console.log(`[INFO] ${message}`);
}

function logWarn(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.warn(`[WARN] ${message}`, meta);
    return;
  }
  console.warn(`[WARN] ${message}`);
}

function logError(message: string, error?: unknown, meta?: Record<string, unknown>): void {
  if (meta) {
    console.error(`[ERROR] ${message}`, meta, error);
    return;
  }
  console.error(`[ERROR] ${message}`, error);
}

async function readJsonBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function decodeDataUri(dataUri: string): Buffer {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid dataUri format');
  }
  return Buffer.from(match[2], 'base64');
}

function readAuth(req: IncomingMessage): AuthJwtPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);
  return verifyJwt(token);
}

function getClientIp(req: IncomingMessage): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(req: IncomingMessage): boolean {
  const key = getClientIp(req);
  const now = Date.now();
  const existing = requestBuckets.get(key);
  if (!existing || now > existing.resetAt) {
    requestBuckets.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
    return false;
  }
  existing.count += 1;
  if (existing.count > config.rateLimitMax) return true;
  return false;
}

const server = createServer(async (req, res) => {
  const requestId = randomUUID().slice(0, 8);
  const startedAt = Date.now();
  try {
    const method = req.method || 'GET';
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const ip = getClientIp(req);

    logInfo('Request start', { requestId, method, pathname, ip });
    res.on('finish', () => {
      logInfo('Request end', {
        requestId,
        method,
        pathname,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    if (isRateLimited(req)) {
      sendJson(req, res, 429, { error: 'Too many requests' });
      return;
    }

    if (method === 'OPTIONS') {
      setCorsHeaders(req, res);
      res.statusCode = 204;
      res.end();
      return;
    }

    if (method === 'GET' && pathname === '/health') {
      sendJson(req, res, 200, { ok: true });
      return;
    }

    if (method === 'POST' && (pathname === '/auth/google' || pathname === '/auth/google/code')) {
      const body = await readJsonBody(req);
      const parsed = authGoogleSchema.safeParse(body);
      if (!parsed.success) {
        logWarn('Validation failed for /auth/google', {
          requestId,
          errors: parsed.error.flatten(),
          bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
        });
        sendJson(req, res, 400, { error: parsed.error.flatten() });
        return;
      }
      const { credential, code } = parsed.data;

      const googleUser = code
        ? await exchangeCodeForGoogleIdentity(code)
        : await verifyGoogleCredential(credential as string);
      const now = new Date().toISOString();
      const existing = await getUserByGoogleId(googleUser.sub);
      const user: UserProfile = existing || {
        userId: randomUUID(),
        googleId: googleUser.sub,
        email: googleUser.email,
        fullName: googleUser.name,
        avatarUrl: googleUser.picture,
        onboardingComplete: false,
        onboardingStep: 1,
        professions: [],
        documents: {},
        createdAt: now,
        updatedAt: now,
      };

      if (!existing) {
        await upsertUser(user);
      } else {
        await patchUser(existing.userId, {
          email: googleUser.email,
          fullName: googleUser.name,
          avatarUrl: googleUser.picture,
        });
      }

      const token = issueJwt({ userId: user.userId, email: user.email });
      const latest = await getUser(user.userId);
      sendJson(req, res, 200, { token, user: latest || user });
      return;
    }

    if (pathname === '/profile') {
      const auth = readAuth(req);
      if (!auth) {
        logWarn('Unauthorized /profile access', { requestId, pathname });
        sendJson(req, res, 401, { error: 'Missing or invalid token' });
        return;
      }

      if (method === 'GET') {
        const user = await getUser(auth.userId);
        if (!user) {
          sendJson(req, res, 404, { error: 'User profile not found' });
          return;
        }
        sendJson(req, res, 200, { user });
        return;
      }

      if (method === 'POST') {
        const body = await readJsonBody(req);
        const parsed = profilePatchSchema.safeParse(body || {});
        if (!parsed.success) {
          logWarn('Validation failed for /profile', {
            requestId,
            errors: parsed.error.flatten(),
            bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
          });
          sendJson(req, res, 400, { error: parsed.error.flatten() });
          return;
        }

        const patched = await patchUser(auth.userId, parsed.data || {});
        if (!patched) {
          sendJson(req, res, 404, { error: 'User profile not found' });
          return;
        }
        sendJson(req, res, 200, { user: patched });
        return;
      }
    }

    if (method === 'POST' && pathname === '/profile/onboard') {
      const auth = readAuth(req);
      if (!auth) {
        logWarn('Unauthorized /profile/onboard access', { requestId, pathname });
        sendJson(req, res, 401, { error: 'Missing or invalid token' });
        return;
      }

      const body = await readJsonBody(req);
      const parsed = onboardSchema.safeParse(body || {});
      if (!parsed.success) {
        logWarn('Validation failed for /profile/onboard', {
          requestId,
          errors: parsed.error.flatten(),
          bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
        });
        sendJson(req, res, 400, { error: parsed.error.flatten() });
        return;
      }
      const step = parsed.data.step;
      const pageData = parsed.data.pageData as Partial<UserProfile>;
      const current = await getUser(auth.userId);
      if (!current) {
        sendJson(req, res, 404, { error: 'User profile not found' });
        return;
      }

      const mergedStep = Math.max(current.onboardingStep || 1, step);
      const merged = await patchUser(auth.userId, {
        ...pageData,
        onboardingStep: mergedStep,
        onboardingComplete: parsed.data.onboardingComplete ?? current.onboardingComplete,
      });

      sendJson(req, res, 200, { user: merged });
      return;
    }

    if (method === 'POST' && pathname === '/vault/process') {
      const auth = readAuth(req);
      if (!auth) {
        logWarn('Unauthorized /vault/process access', { requestId, pathname });
        sendJson(req, res, 401, { error: 'Missing or invalid token' });
        return;
      }

      const body = await readJsonBody(req);
      const parsed = processVaultSchema.safeParse(body || {});
      if (!parsed.success) {
        logWarn('Validation failed for /vault/process', {
          requestId,
          errors: parsed.error.flatten(),
          bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
        });
        sendJson(req, res, 400, { error: parsed.error.flatten() });
        return;
      }
      const { dataUri, docType, fileUrl, storagePath } = parsed.data;

      const current = await getUser(auth.userId);
      if (!current) {
        sendJson(req, res, 404, { error: 'User profile not found' });
        return;
      }

      try {
        const extractedData = await runDocumentExtraction(dataUri, docType);
        const now = new Date().toISOString();
        const doc: UserDocument = {
          fileUrl,
          storagePath,
          extractedData,
          status: 'verified',
          uploadedAt: current.documents?.[docType]?.uploadedAt || now,
          processedAt: now,
        };

        const updated = await patchUser(auth.userId, {
          documents: {
            ...current.documents,
            [docType]: doc,
          },
        });

        sendJson(req, res, 200, { document: doc, user: updated });
        return;
      } catch (error) {
        logError('Vault processing failed', error, { requestId, docType });
        const now = new Date().toISOString();
        const failed: UserDocument = {
          fileUrl,
          storagePath,
          extractedData: null,
          status: 'rejected',
          uploadedAt: current.documents?.[docType]?.uploadedAt || now,
          processedAt: now,
          error: 'processing_failed',
        };

        const updated = await patchUser(auth.userId, {
          documents: {
            ...current.documents,
            [docType]: failed,
          },
        });

        sendJson(req, res, 500, { error: 'Processing failed', user: updated });
        return;
      }
    }

    if (method === 'POST' && pathname === '/vault/upload') {
      const auth = readAuth(req);
      if (!auth) {
        logWarn('Unauthorized /vault/upload access', { requestId, pathname });
        sendJson(req, res, 401, { error: 'Missing or invalid token' });
        return;
      }

      const body = await readJsonBody(req);
      const parsed = uploadVaultSchema.safeParse(body || {});
      if (!parsed.success) {
        logWarn('Validation failed for /vault/upload', {
          requestId,
          errors: parsed.error.flatten(),
          bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
        });
        sendJson(req, res, 400, { error: parsed.error.flatten() });
        return;
      }

      const { docType, fileName, mimeType, dataUri } = parsed.data;
      const current = await getUser(auth.userId);
      if (!current) {
        sendJson(req, res, 404, { error: 'User profile not found' });
        return;
      }

      try {
        const fileBuffer = decodeDataUri(dataUri);
        const uploaded = await uploadToFirebaseStorage({
          userId: auth.userId,
          docType,
          fileName,
          mimeType,
          fileBuffer,
        });

        const now = new Date().toISOString();
        const updated = await patchUser(auth.userId, {
          documents: {
            ...current.documents,
            [docType]: {
              fileUrl: uploaded.fileUrl,
              storagePath: uploaded.storagePath,
              extractedData: current.documents?.[docType]?.extractedData || null,
              status: 'processing',
              uploadedAt: now,
              processedAt: current.documents?.[docType]?.processedAt,
              error: undefined,
            },
          },
        });

        sendJson(req, res, 200, {
          fileUrl: uploaded.fileUrl,
          storagePath: uploaded.storagePath,
          user: updated,
        });
        return;
      } catch (error) {
        logError('Upload to Firebase Storage failed', error, { requestId, docType });
        sendJson(req, res, 500, { error: 'Upload failed' });
        return;
      }
    }

    sendJson(req, res, 404, { error: 'Not found' });
  } catch (error) {
    logError('Unhandled server error', error, { requestId });
    sendJson(req, res, 500, { error: 'Internal server error' });
  }
});

async function start(): Promise<void> {
  await initDb();
  server.listen(config.port, () => {
    logInfo(`Sabapplier backend listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  logError('Failed to start backend', error);
  process.exit(1);
});
