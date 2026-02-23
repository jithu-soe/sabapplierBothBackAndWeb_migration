"use client";

import React, { useEffect, useState } from 'react';
import { UserProfile, Profession, QUALIFICATIONS, CATEGORIES, RELIGIONS, STATES, LANGUAGES, MARITAL_STATUSES, DISABILITY_OPTIONS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, ShieldCheck, Edit3, Save, MapPin, Briefcase, GraduationCap, Check, FileCheck2, Settings, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface ProfileProps {
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
  onDeleteAccount: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, saveUser, onDeleteAccount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user.avatarUrl]);

  const handleSave = () => {
    saveUser({
      ...editedUser,
      fullName: `${editedUser.firstName} ${editedUser.lastName}`
    });
    setIsEditing(false);
  };

  const toggleProfession = (p: Profession) => {
    const current = [...editedUser.professions];
    if (current.includes(p)) {
      setEditedUser({ ...editedUser, professions: current.filter(x => x !== p) });
    } else if (current.length < 3) {
      setEditedUser({ ...editedUser, professions: [...current, p] });
    }
  };

  const personalDocuments = [
    { label: 'Passport Size Photo', keys: ['passport_photo', 'Passport Photo'] },
    { label: 'Aadhaar Card', keys: ['aadhaar_card', 'Aadhaar Card'] },
    { label: 'Signature', keys: ['signature', 'Signature'] },
    { label: 'PAN Card', keys: ['pan_card', 'PAN Card'] },
    { label: '10th Marksheet', keys: ['10th_marksheet', '10th Marksheet'] },
    { label: '12th Marksheet', keys: ['12th_marksheet', '12th Marksheet'] },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-6">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-slate-50 text-primary border-slate-200 flex items-center gap-2">
          <User className="w-3 h-3" /> Profile Settings
        </Badge>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tighter">
            My <span className="text-[#2F56C0]">Profile</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => {
              setEditedUser(user);
              setIsEditing(true);
            }}
            className="h-12 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform hover:scale-105"
          >
            <Edit3 className="w-5 h-5" /> Edit Profile
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl text-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Profile Settings</DialogTitle>
                <DialogDescription>
                  Manage your account preferences and data.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4 space-y-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                  </div>
                  <p className="text-xs text-red-600/80 leading-relaxed">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full font-bold"
                    onClick={() => {
                      const confirmed = window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
                      if (confirmed) {
                        onDeleteAccount();
                        setIsSettingsOpen(false);
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-8 relative overflow-hidden group dashboard-card">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2F56C0]" />
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 bg-primary rounded-[3rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden">
                  {user.avatarUrl && !avatarLoadFailed ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarLoadFailed(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.firstName?.[0]
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-primary">{user.fullName}</h2>
                <p className="text-muted-foreground font-medium">{user.email}</p>
              </div>

              <div className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Signed in with Google
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 dashboard-card">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Core Stats</h4>
            <div className="space-y-4">
              <StatItem label="Verified Documents" value={Object.keys(user.documents).length} />
              <StatItem label="Profile Strength" value="85%" />
              <StatItem label="Account Type" value="Identity Vault Free" />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailSection title="Basic Bio & Contact" icon={<Mail className="w-5 h-5 text-[#2F56C0]" />}>
              <DetailItem label="Full Name" value={`${user.firstName} ${user.middleName || ''} ${user.lastName}`} />
              <DetailItem label="Date of Birth" value={user.dob} />
              <DetailItem label="Phone Number" value={user.phone} />
              <DetailItem label="Father's Name" value={user.fatherName} />
              <DetailItem label="Mother's Name" value={user.motherName} />
              <DetailItem label="Permanent Address" value={user.permanentAddress} />
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Personal Documents</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {personalDocuments.map((doc) => {
                    const matchedDoc = doc.keys.map((key) => user.documents?.[key]).find(Boolean);
                    const isUploaded = Boolean(matchedDoc?.fileUrl);
                    return (
                      <div
                        key={doc.label}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold ${
                          isUploaded
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span>{doc.label}</span>
                        <span className="inline-flex items-center gap-1">
                          {isUploaded && <FileCheck2 className="w-3 h-3" />}
                          {isUploaded ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Identity & Education" icon={<GraduationCap className="w-5 h-5 text-purple-500" />}>
              <DetailItem label="Gender" value={user.gender} />
              <DetailItem label="Mother Tongue" value={user.motherTongue} />
              <DetailItem label="Highest Qualification" value={user.highestQualification} />
              <DetailItem label="Social Category" value={user.socialCategory} />
              <DetailItem label="Religion" value={user.religion} />
              <DetailItem label="Marital Status" value={user.maritalStatus} />
              <DetailItem label="Disability Status" value={user.disabilityStatus} />
            </DetailSection>

            <DetailSection title="Professional Roles" icon={<Briefcase className="w-5 h-5 text-green-500" />}>
              <div className="flex flex-wrap gap-2 pt-2">
                {user.professions.map(p => (
                  <Badge key={p} className="bg-slate-100 text-primary hover:bg-slate-200 font-bold px-3 py-1 rounded-lg border border-slate-200">
                    {p}
                  </Badge>
                ))}
                {user.professions.length === 0 && <span className="text-xs text-muted-foreground italic">None specified</span>}
              </div>
            </DetailSection>

            <DetailSection title="Geographic Details" icon={<MapPin className="w-5 h-5 text-red-500" />}>
              <DetailItem label="Nationality" value={user.nationality} />
              <DetailItem label="Domicile State" value={user.domicileState} />
              <DetailItem label="District" value={user.district} />
              <DetailItem label="Mandal" value={user.mandal} />
              <DetailItem label="Pincode" value={user.pincode} />
            </DetailSection>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2.5rem]">
          <DialogHeader className="p-8 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-3xl font-black text-primary tracking-tight">Edit Profile</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Update your personal and professional information</DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-10 bg-slate-50/50">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">First Name</Label>
                  <Input value={editedUser.firstName} onChange={e => setEditedUser({...editedUser, firstName: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Last Name</Label>
                  <Input value={editedUser.lastName} onChange={e => setEditedUser({...editedUser, lastName: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Middle Name</Label>
                  <Input value={editedUser.middleName} onChange={e => setEditedUser({...editedUser, middleName: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Phone Number</Label>
                  <Input value={editedUser.phone} onChange={e => setEditedUser({...editedUser, phone: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Date of Birth</Label>
                  <Input type="date" value={editedUser.dob} onChange={e => setEditedUser({...editedUser, dob: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Gender</Label>
                  <Select value={editedUser.gender} onValueChange={v => setEditedUser({...editedUser, gender: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Father's Name</Label>
                  <Input value={editedUser.fatherName || ''} onChange={e => setEditedUser({...editedUser, fatherName: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Mother's Name</Label>
                  <Input value={editedUser.motherName || ''} onChange={e => setEditedUser({...editedUser, motherName: e.target.value})} className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary">Permanent Address</Label>
                <Textarea value={editedUser.permanentAddress} onChange={e => setEditedUser({...editedUser, permanentAddress: e.target.value})} className="min-h-[100px] rounded-xl" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Education & Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Mother Tongue</Label>
                  <Select value={editedUser.motherTongue} onValueChange={v => setEditedUser({...editedUser, motherTongue: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Highest Qualification</Label>
                  <Select value={editedUser.highestQualification} onValueChange={v => setEditedUser({...editedUser, highestQualification: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Social Category</Label>
                  <Select value={editedUser.socialCategory} onValueChange={v => setEditedUser({...editedUser, socialCategory: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Religion</Label>
                  <Select value={editedUser.religion} onValueChange={v => setEditedUser({...editedUser, religion: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Marital Status</Label>
                  <Select value={editedUser.maritalStatus} onValueChange={v => setEditedUser({...editedUser, maritalStatus: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARITAL_STATUSES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Disability Status</Label>
                  <Select value={editedUser.disabilityStatus} onValueChange={v => setEditedUser({...editedUser, disabilityStatus: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISABILITY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Professional Roles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(['Student', 'Professional', 'Founder', 'Researcher', 'Other'] as Profession[]).map(p => (
                  <Button
                    key={p}
                    type="button"
                    variant={editedUser.professions.includes(p) ? 'default' : 'outline'}
                    className="justify-between px-4 h-12 rounded-xl text-xs font-bold"
                    onClick={() => toggleProfession(p)}
                  >
                    {p}
                    {editedUser.professions.includes(p) && <Check className="w-4 h-4" />}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Geographic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Nationality</Label>
                  <Input value={editedUser.nationality} onChange={e => setEditedUser({...editedUser, nationality: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Domicile State</Label>
                  <Select value={editedUser.domicileState} onValueChange={v => setEditedUser({...editedUser, domicileState: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">District</Label>
                  <Input value={editedUser.district} onChange={e => setEditedUser({...editedUser, district: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Mandal</Label>
                  <Input value={editedUser.mandal || ''} onChange={e => setEditedUser({...editedUser, mandal: e.target.value})} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Pincode</Label>
                  <Input value={editedUser.pincode} maxLength={6} onChange={e => setEditedUser({...editedUser, pincode: e.target.value})} className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t bg-white flex justify-end gap-4 sticky bottom-0">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="h-12 px-8 rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={handleSave} className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-[#2F56C0]/30">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-black text-primary">{value}</span>
  </div>
);

const DetailSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Card className="p-8 space-y-6 dashboard-card">
    <h3 className="text-lg font-black text-primary flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </Card>
);

const DetailItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1">
    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
    <div className="text-sm font-bold text-primary truncate">{value || 'Not provided'}</div>
  </div>
);
