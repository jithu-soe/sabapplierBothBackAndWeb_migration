"use client";

import React from 'react';
import { UserProfile, Profession, QUALIFICATIONS, CATEGORIES, RELIGIONS, STATES, LANGUAGES } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Check, ShieldCheck } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';

interface OnboardingWizardProps {
  userId: string;
  authToken: string;
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId, authToken, user, saveUser }) => {
  const currentStep = user.onboardingStep;
  const TOTAL_STEPS = 4;
  const progress = (currentStep / TOTAL_STEPS) * 100;

  const validateStep = () => {
    if (currentStep === 1) {
      return !!(user.firstName && user.lastName && user.dob && user.phone && user.permanentAddress);
    }
    if (currentStep === 2) {
      return !!(user.gender && user.motherTongue && user.professions.length > 0);
    }
    if (currentStep === 3) {
      return !!(user.nationality && user.domicileState && user.district && user.pincode);
    }
    if (currentStep === 4) {
      // Step 4 is optional for onboarding completion.
      return true;
    }
    return false;
  };

  const isStepValid = validateStep();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      saveUser({ ...user, onboardingStep: currentStep + 1 });
    } else {
      saveUser({ ...user, onboardingComplete: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      saveUser({ ...user, onboardingStep: currentStep - 1 });
    }
  };

  const handleDocumentUpdate = (docType: string, url?: string, aiData?: any) => {
    const updatedDocs = { ...user.documents };
    const existing = updatedDocs[docType];
    updatedDocs[docType] = {
      fileUrl: url || existing?.fileUrl || '',
      extractedData: aiData || existing?.extractedData || null,
      status: aiData ? 'verified' : 'processing',
      uploadedAt: existing?.uploadedAt || new Date().toISOString(),
      processedAt: aiData ? new Date().toISOString() : existing?.processedAt,
    };
    saveUser({ ...user, documents: updatedDocs });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-black text-primary tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground font-medium">Step {currentStep} of {TOTAL_STEPS}</p>
          <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />
        </div>

        <Card className="p-8 border-border shadow-xl">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Basic Bio & Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      placeholder="First Name"
                      value={user.firstName || ''}
                      onChange={(e) => saveUser({ ...user, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      placeholder="Last Name"
                      value={user.lastName || ''}
                      onChange={(e) => saveUser({ ...user, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={user.dob || ''}
                      onChange={(e) => saveUser({ ...user, dob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      placeholder="+91"
                      value={user.phone || ''}
                      onChange={(e) => saveUser({ ...user, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Parents Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Father's Name</Label>
                    <Input
                      placeholder="Father's Name"
                      value={user.fatherName || ''}
                      onChange={(e) => saveUser({ ...user, fatherName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input
                      placeholder="Mother's Name"
                      value={user.motherName || ''}
                      onChange={(e) => saveUser({ ...user, motherName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Permanent Address *</Label>
                <Textarea
                  placeholder="Street, City, Building..."
                  value={user.permanentAddress || ''}
                  onChange={(e) => saveUser({ ...user, permanentAddress: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Identity & Profession</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={user.gender} onValueChange={(v) => saveUser({ ...user, gender: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mother Tongue *</Label>
                    <Select value={user.motherTongue} onValueChange={(v) => saveUser({ ...user, motherTongue: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Education Qualification</Label>
                <Select value={user.highestQualification} onValueChange={(v) => saveUser({ ...user, highestQualification: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATIONS.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Profession (Select up to 3) *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['Student', 'Professional', 'Founder', 'Researcher', 'Other'] as Profession[]).map(p => (
                    <Button
                      key={p}
                      variant={user.professions.includes(p) ? 'default' : 'outline'}
                      className="justify-between px-4 h-14 rounded-xl"
                      onClick={() => {
                        const current = [...user.professions];
                        if (current.includes(p)) {
                          saveUser({ ...user, professions: current.filter(x => x !== p) });
                        } else if (current.length < 3) {
                          saveUser({ ...user, professions: [...current, p] });
                        }
                      }}
                    >
                      {p}
                      {user.professions.includes(p) && <Check className="w-4 h-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Social & Geographic</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Social Category</Label>
                    <Select value={user.socialCategory} onValueChange={(v) => saveUser({ ...user, socialCategory: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Religion</Label>
                    <Select value={user.religion} onValueChange={(v) => saveUser({ ...user, religion: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality *</Label>
                  <Input placeholder="Indian" value={user.nationality || ''} onChange={(e) => saveUser({ ...user, nationality: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Domicile State *</Label>
                  <Select value={user.domicileState} onValueChange={(v) => saveUser({ ...user, domicileState: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Input placeholder="District" value={user.district || ''} onChange={(e) => saveUser({ ...user, district: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input placeholder="6-digit PIN" maxLength={6} value={user.pincode || ''} onChange={(e) => saveUser({ ...user, pincode: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">Upload Verification Documents</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  These documents help us automatically fill 80% of application forms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="Passport Size Photo *"
                  docType="passport_photo"
                  currentUrl={user.documents?.['passport_photo']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('passport_photo', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('passport_photo', undefined, data)}
                />
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="Aadhaar Card *"
                  docType="aadhaar_card"
                  currentUrl={user.documents?.['aadhaar_card']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('aadhaar_card', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('aadhaar_card', undefined, data)}
                />
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="Signature"
                  docType="signature"
                  currentUrl={user.documents?.['signature']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('signature', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('signature', undefined, data)}
                />
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="PAN Card"
                  docType="pan_card"
                  currentUrl={user.documents?.['pan_card']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('pan_card', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('pan_card', undefined, data)}
                />
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="10th Marksheet"
                  docType="10th_marksheet"
                  currentUrl={user.documents?.['10th_marksheet']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('10th_marksheet', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('10th_marksheet', undefined, data)}
                />
                <DocumentUpload
                  userId={userId}
                  authToken={authToken}
                  label="12th Marksheet"
                  docType="12th_marksheet"
                  currentUrl={user.documents?.['12th_marksheet']?.fileUrl}
                  onUploadComplete={(url) => handleDocumentUpdate('12th_marksheet', url)}
                  onExtractionComplete={(data) => handleDocumentUpdate('12th_marksheet', undefined, data)}
                />
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4 pt-6 border-t">
            {currentStep > 1 && (
              <Button variant="ghost" onClick={handleBack} className="flex-1 h-12">
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
            )}
            <Button
              disabled={!isStepValid}
              onClick={handleNext}
              className="flex-[2] h-12 shadow-lg shadow-primary/20"
            >
              {currentStep === TOTAL_STEPS ? 'Complete Profile' : 'Continue'} <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
