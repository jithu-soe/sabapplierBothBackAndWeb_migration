"use client";

import React from 'react';
import { UserProfile } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { User, MapPin, Briefcase, Award, Clock } from 'lucide-react';

export const Home: React.FC<{ user: UserProfile }> = ({ user }) => {
  const getProfileStrength = () => {
    let score = 0;
    if (user.firstName && user.lastName) score += 20;
    if (user.phone) score += 10;
    if (user.permanentAddress) score += 10;
    if (user.professions.length > 0) score += 20;
    if (user.domicileState) score += 10;
    score += Math.min(30, Object.keys(user.documents).length * 10);
    return score;
  };

  const strength = getProfileStrength();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl">
            {user.firstName?.[0]}
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight">Welcome, {user.firstName}</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {user.district}, {user.domicileState}
            </p>
          </div>
        </div>

        <Card className="p-6 w-full md:w-80 bg-gradient-to-br from-white to-secondary border-none shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Profile Strength</span>
            <span className="text-lg font-black text-primary">{strength}%</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${strength}%` }}
            />
          </div>
        </Card>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="p-8 space-y-6">
          <h3 className="text-lg font-black text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Basic Identity
          </h3>
          <div className="space-y-4">
            <InfoField label="Full Name" value={`${user.firstName} ${user.middleName || ''} ${user.lastName}`} />
            <InfoField label="DOB" value={user.dob} />
            <InfoField label="Phone" value={user.phone} />
            <InfoField label="Mother Tongue" value={user.motherTongue} />
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <h3 className="text-lg font-black text-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" /> Professional
          </h3>
          <div className="space-y-4">
            <InfoField label="Qualification" value={user.highestQualification} />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Professions</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {user.professions.map(p => (
                  <span key={p} className="px-3 py-1 bg-secondary text-primary text-xs font-bold rounded-lg">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <h3 className="text-lg font-black text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" /> Active Applications
          </h3>
          <div className="space-y-4 empty:after:content-['No_active_applications'] empty:after:text-xs empty:after:text-muted-foreground">
            {/* Simulation of future features */}
            <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">🚀</div>
              <div>
                <div className="text-sm font-bold">Passport Verification</div>
                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated 2d ago
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1">
    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
    <div className="text-sm font-bold text-primary truncate">{value || 'Not provided'}</div>
  </div>
);