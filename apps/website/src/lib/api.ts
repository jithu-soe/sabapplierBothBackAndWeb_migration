import { UserProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function authWithGoogleCredential(credential: string): Promise<{ token: string; user: UserProfile }> {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function authWithGoogleCode(code: string): Promise<{ token: string; user: UserProfile }> {
  return apiRequest('/auth/google/code', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function fetchProfile(token: string): Promise<{ user: UserProfile }> {
  return apiRequest('/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function saveProfile(token: string, data: Partial<UserProfile>): Promise<{ user: UserProfile }> {
  return apiRequest('/profile', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function saveOnboardingStep(
  token: string,
  pageData: Partial<UserProfile>,
  step: number,
  onboardingComplete?: boolean
): Promise<{ user: UserProfile }> {
  return apiRequest('/profile/onboard', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pageData, step, onboardingComplete }),
  });
}

export async function processVaultDocument(
  token: string,
  payload: { dataUri: string; docType: string; fileUrl: string; storagePath?: string }
): Promise<{ user: UserProfile }> {
  return apiRequest('/vault/process', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
