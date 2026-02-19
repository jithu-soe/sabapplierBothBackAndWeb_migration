export type Profession = 'Student' | 'Professional' | 'Founder' | 'Researcher' | 'Other';

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  onboardingComplete: boolean;
  onboardingStep: number;
  
  // Page 1: Basic Bio & Contact
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  permanentAddress?: string;
  
  // Page 2: Identity & Profession
  motherTongue?: string;
  gender?: string;
  highestQualification?: string;
  professions: Profession[];
  
  // Page 3: Social & Geographic
  socialCategory?: string;
  disabilityStatus?: string;
  maritalStatus?: string;
  religion?: string;
  nationality?: string;
  domicileState?: string;
  district?: string;
  mandal?: string;
  pincode?: string;
  
  documents: Record<string, {
    fileUrl: string;
    storagePath?: string;
    extractedData?: Record<string, unknown> | null;
    error?: string;
    uploadedAt: string;
    processedAt?: string;
    status: 'idle' | 'processing' | 'verified' | 'rejected' 
  }>;
}

export const QUALIFICATIONS = [
  '10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate', 'PhD'
];

export const CATEGORIES = [
  'General', 'OBC', 'SC', 'ST', 'EWS'
];

export const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'
];

export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Other'
];

export const LANGUAGES = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'
];
