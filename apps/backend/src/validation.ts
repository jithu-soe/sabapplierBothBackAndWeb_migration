import { z } from 'zod';

const documentSchema = z.object({
  fileUrl: z.string().min(1),
  storagePath: z.string().optional(),
  extractedData: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(['idle', 'processing', 'verified', 'rejected']),
  uploadedAt: z.string(),
  processedAt: z.string().optional(),
  error: z.string().optional(),
});

export const authGoogleSchema = z
  .object({
    credential: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.credential || v.code), {
    message: 'Either credential or code is required',
  });

export const profilePatchSchema = z
  .object({
    email: z.string().email().optional(),
    fullName: z.string().min(1).optional(),
    avatarUrl: z.string().url().optional(),
    onboardingComplete: z.boolean().optional(),
    onboardingStep: z.number().int().min(1).max(4).optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    dob: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    phone: z.string().optional(),
    permanentAddress: z.string().optional(),
    motherTongue: z.string().optional(),
    gender: z.string().optional(),
    highestQualification: z.string().optional(),
    professions: z.array(z.enum(['Student', 'Professional', 'Founder', 'Researcher', 'Other'])).optional(),
    socialCategory: z.string().optional(),
    disabilityStatus: z.string().optional(),
    maritalStatus: z.string().optional(),
    religion: z.string().optional(),
    nationality: z.string().optional(),
    domicileState: z.string().optional(),
    district: z.string().optional(),
    mandal: z.string().optional(),
    pincode: z.string().optional(),
    documents: z.record(z.string(), documentSchema).optional(),
  })
  .strict();

export const onboardSchema = z.object({
  step: z.number().int().min(1).max(4),
  onboardingComplete: z.boolean().optional(),
  pageData: profilePatchSchema.default({}),
});

export const processVaultSchema = z.object({
  dataUri: z.string().startsWith('data:'),
  docType: z.string().min(1),
  fileUrl: z.string().url(),
  storagePath: z.string().optional(),
});

export const uploadVaultSchema = z.object({
  docType: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataUri: z.string().startsWith('data:'),
});
