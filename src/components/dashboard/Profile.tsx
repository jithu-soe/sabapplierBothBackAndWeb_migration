"use client";

import React, { useState } from 'react';
import { UserProfile, Profession, QUALIFICATIONS, CATEGORIES, RELIGIONS, STATES, LANGUAGES } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, ShieldCheck, Edit3, Save, X, Phone, MapPin, Briefcase, GraduationCap, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface ProfileProps {
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, saveUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);

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

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-6">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-2">
          <User className="w-3 h-3" /> Profile Settings
        </Badge>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tighter">
            My <span className="text-blue-600">Profile</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Manage your personal information and account settings
          </p>
        </div>

        <Button 
          onClick={() => {
            setEditedUser(user);
            setIsEditing(true);
          }}
          className="h-12 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center gap-3 transition-transform hover:scale-105"
        >
          <Edit3 className="w-5 h-5" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 bg-primary rounded-[3rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                  {user.firstName?.[0]}
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

          <Card className="p-8 space-y-6">
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
            <DetailSection title="Basic Bio & Contact" icon={<Mail className="w-5 h-5 text-blue-500" />}>
              <DetailItem label="Full Name" value={`${user.firstName} ${user.middleName || ''} ${user.lastName}`} />
              <DetailItem label="Date of Birth" value={user.dob} />
              <DetailItem label="Phone Number" value={user.phone} />
              <DetailItem label="Permanent Address" value={user.permanentAddress} />
            </DetailSection>

            <DetailSection title="Identity & Education" icon={<GraduationCap className="w-5 h-5 text-purple-500" />}>
              <DetailItem label="Gender" value={user.gender} />
              <DetailItem label="Mother Tongue" value={user.motherTongue} />
              <DetailItem label="Highest Qualification" value={user.highestQualification} />
              <DetailItem label="Social Category" value={user.socialCategory} />
            </DetailSection>

            <DetailSection title="Professional Roles" icon={<Briefcase className="w-5 h-5 text-green-500" />}>
              <div className="flex flex-wrap gap-2 pt-2">
                {user.professions.map(p => (
                  <Badge key={p} className="bg-secondary text-primary hover:bg-secondary font-bold px-3 py-1 rounded-lg border-none">
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
            <Button onClick={handleSave} className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
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
  <Card className="p-8 space-y-6">
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
