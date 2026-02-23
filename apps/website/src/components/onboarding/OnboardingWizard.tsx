"use client";

import React, { useEffect } from 'react';
import { UserProfile, Profession, QUALIFICATIONS, CATEGORIES, RELIGIONS, STATES, LANGUAGES, MARITAL_STATUSES, DISABILITY_OPTIONS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  authToken: string;
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, saveUser }) => {
  const TOTAL_STEPS = 3;
  const currentStep = Math.min(user.onboardingStep || 1, TOTAL_STEPS);
  const progress = (currentStep / TOTAL_STEPS) * 100;

  useEffect(() => {
    if ((user.onboardingStep || 1) > TOTAL_STEPS && !user.onboardingComplete) {
      saveUser({ ...user, onboardingStep: TOTAL_STEPS });
    }
  }, [user, saveUser]);

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
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Select value={user.maritalStatus} onValueChange={(v) => saveUser({ ...user, maritalStatus: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Marital Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUSES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Disability Status</Label>
                    <Select value={user.disabilityStatus} onValueChange={(v) => saveUser({ ...user, disabilityStatus: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISABILITY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                  <Label>Mandal</Label>
                  <Input placeholder="Mandal" value={user.mandal || ''} onChange={(e) => saveUser({ ...user, mandal: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input placeholder="6-digit PIN" maxLength={6} value={user.pincode || ''} onChange={(e) => saveUser({ ...user, pincode: e.target.value })} />
                </div>
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
