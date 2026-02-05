"use client";

import React from 'react';
import { UserProfile } from '@/lib/types';
import { LogOut, Home, FileText, Share2, Shield } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'documents' | 'sharing') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  return (
    <nav className="glass-nav text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-black tracking-tight">SABAPPLIER</div>
              <div className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">Identity Vault</div>
            </div>
          </div>

          <div className="hidden md:flex gap-8">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')}
              icon={<Home className="w-4 h-4" />}
              label="Home"
            />
            <NavButton 
              active={activeTab === 'documents'} 
              onClick={() => setActiveTab('documents')}
              icon={<FileText className="w-4 h-4" />}
              label="Documents"
            />
            <NavButton 
              active={activeTab === 'sharing'} 
              onClick={() => setActiveTab('sharing')}
              icon={<Share2 className="w-4 h-4" />}
              label="Data Sharing"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold">{user.fullName}</div>
            <div className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">
              {user.professions.join(' • ')}
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${
      active ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);