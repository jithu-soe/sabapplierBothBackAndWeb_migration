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

  // Local state to prevent input lag and API spam
  const [localUser, setLocalUser] = React.useState<UserProfile>(user);
  
  // Update local state when prop changes, but only if not currently editing (optional logic, 
  // but for now simple sync is safer, expecting parent updates to be consistent).
  // However, strict sync might overwrite user input if parent lags. 
  // We'll rely on localUser for inputs.
  useEffect(() => {
    // Only update fields that might have changed externally if needed
    // For now, we trust local state for the form inputs.
    // But we should sync if the step changes or on initial mount.
  }, []);

  // Debounce saveUser
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only save if there are differences to avoid loops
      if (JSON.stringify(localUser) !== JSON.stringify(user)) {
        saveUser(localUser);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(handler);
  }, [localUser, saveUser, user]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setLocalUser(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessionChange = (p: Profession) => {
    const current = [...(localUser.professions || [])];
    if (current.includes(p)) {
      handleChange('professions', current.filter(x => x !== p));
    } else if (current.length < 3) {
      handleChange('professions', [...current, p]);
    }
  };

  const validateStep = () => {
    const u = localUser;
    if (currentStep === 1) {
      return !!(u.firstName && u.lastName && u.dob && u.phone && u.permanentAddress);
    }
    if (currentStep === 2) {
      return !!(u.gender && u.motherTongue && u.professions && u.professions.length > 0);
    }
    if (currentStep === 3) {
      return !!(u.nationality && u.domicileState && u.district && u.pincode);
    }
    return false;
  };

  const isStepValid = validateStep();

  const handleNext = () => {
    // Force save immediately on navigation
    saveUser({ ...localUser, onboardingStep: currentStep < TOTAL_STEPS ? currentStep + 1 : currentStep });
    if (currentStep === TOTAL_STEPS) {
       saveUser({ ...localUser, onboardingComplete: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Force save on back too
      saveUser({ ...localUser, onboardingStep: currentStep - 1 });
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
                      value={localUser.firstName || ''}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      placeholder="Last Name"
                      value={localUser.lastName || ''}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={localUser.dob || ''}
                      onChange={(e) => handleChange('dob', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      placeholder="+91"
                      value={localUser.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
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
                      value={localUser.fatherName || ''}
                      onChange={(e) => handleChange('fatherName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input
                      placeholder="Mother's Name"
                      value={localUser.motherName || ''}
                      onChange={(e) => handleChange('motherName', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Permanent Address *</Label>
                <Textarea
                  placeholder="Street, City, Building..."
                  value={localUser.permanentAddress || ''}
                  onChange={(e) => handleChange('permanentAddress', e.target.value)}
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
                    <Select value={localUser.gender} onValueChange={(v) => handleChange('gender', v)}>
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
                    <Select value={localUser.motherTongue} onValueChange={(v) => handleChange('motherTongue', v)}>
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
                <Select value={localUser.highestQualification} onValueChange={(v) => handleChange('highestQualification', v)}>
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
                      variant={localUser.professions?.includes(p) ? 'default' : 'outline'}
                      className="justify-between px-4 h-14 rounded-xl"
                      onClick={() => handleProfessionChange(p)}
                    >
                      {p}
                      {localUser.professions?.includes(p) && <Check className="w-4 h-4" />}
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
                    <Select value={localUser.socialCategory} onValueChange={(v) => handleChange('socialCategory', v)}>
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
                    <Select value={localUser.religion} onValueChange={(v) => handleChange('religion', v)}>
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
                    <Select value={localUser.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)}>
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
                    <Select value={localUser.disabilityStatus} onValueChange={(v) => handleChange('disabilityStatus', v)}>
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
                  <Input placeholder="Indian" value={localUser.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Domicile State *</Label>
                  <Select value={localUser.domicileState} onValueChange={(v) => handleChange('domicileState', v)}>
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
                  <Input placeholder="District" value={localUser.district || ''} onChange={(e) => handleChange('district', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mandal</Label>
                  <Input placeholder="Mandal" value={localUser.mandal || ''} onChange={(e) => handleChange('mandal', e.target.value)} />
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
