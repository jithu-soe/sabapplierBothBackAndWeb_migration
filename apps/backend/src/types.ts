export type Profession = 'Student' | 'Professional' | 'Founder' | 'Researcher' | 'Other';

export type DocumentStatus = 'idle' | 'processing' | 'verified' | 'rejected';
export type MarketSegment = 'india' | 'global_founder';

export interface CoFounderProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedInProfile?: string;
  education?: string;
  workExperience?: string;
  startupRole?: string;
}

export interface UserDocument {
  fileUrl?: string;
  storagePath?: string;
  extractedData?: Record<string, unknown> | null;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  error?: string;
  folder?: string;
}

export interface UserProfile {
  userId: string;
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  countryCode?: string;
  marketSegment?: MarketSegment;
  onboardingComplete: boolean;
  onboardingStep: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  permanentAddress?: string;
  motherTongue?: string;
  gender?: string;
  highestQualification?: string;
  professions: Profession[];
  socialCategory?: string;
  disabilityStatus?: string;
  maritalStatus?: string;
  religion?: string;
  nationality?: string;
  domicileState?: string;
  district?: string;
  mandal?: string;
  pincode?: string;
  linkedInProfile?: string;
  education?: string;
  workExperience?: string;
  startupRole?: string;
  coFounders?: CoFounderProfile[];
  startupName?: string;
  startupWebsite?: string;
  startupLinkedInProfile?: string;
  industry?: string;
  startupStage?: string;
  incorporationDate?: string;
  companyType?: string;
  documents: Record<string, UserDocument>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthJwtPayload {
  userId: string;
  email: string;
  onboardingComplete: boolean;
}
