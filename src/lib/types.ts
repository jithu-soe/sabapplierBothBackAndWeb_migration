export type Profession = 'Student' | 'Professional' | 'Founder' | 'Researcher' | 'Other';

export interface UserProfile {
  email: string;
  fullName: string;
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
    url: string; 
    aiData: any; 
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
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 
  'Kerala', 'Gujarat', 'Rajasthan', 'Delhi', 'Other'
];

export const LANGUAGES = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'
];