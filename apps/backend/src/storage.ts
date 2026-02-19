import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from './config';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function getAdminBucket() {
  const appMod = await import('firebase-admin/app');
  const storageMod = await import('firebase-admin/storage');
  const { getApps, initializeApp, cert, applicationDefault } = appMod;

  if (!config.firebaseStorageBucket) {
    throw new Error('FIREBASE_STORAGE_BUCKET is not configured');
  }

  if (getApps().length === 0) {
    const options: Record<string, unknown> = {
      storageBucket: config.firebaseStorageBucket,
    };

    if (config.firebaseServiceAccountPath) {
      const servicePath = path.isAbsolute(config.firebaseServiceAccountPath)
        ? config.firebaseServiceAccountPath
        : path.resolve(process.cwd(), config.firebaseServiceAccountPath);
      const raw = fs.readFileSync(servicePath, 'utf8');
      options.credential = cert(JSON.parse(raw));
    } else {
      options.credential = applicationDefault();
    }

    initializeApp(options);
  }

  return storageMod.getStorage().bucket(config.firebaseStorageBucket);
}

export async function uploadToFirebaseStorage(input: {
  userId: string;
  docType: string;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
}): Promise<{ fileUrl: string; storagePath: string }> {
  const bucket = await getAdminBucket();
  const safeName = sanitizeFileName(input.fileName);
  const storagePath = `users/${input.userId}/documents/${input.docType}/${Date.now()}_${safeName}`;
  const token = randomUUID();

  const file = bucket.file(storagePath);
  await file.save(input.fileBuffer, {
    resumable: false,
    contentType: input.mimeType,
    metadata: {
      contentType: input.mimeType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const fileUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

  return { fileUrl, storagePath };
}

export async function deleteUserStorageData(userId: string): Promise<void> {
  const bucket = await getAdminBucket();
  await bucket.deleteFiles({ prefix: `users/${userId}/` });
}
