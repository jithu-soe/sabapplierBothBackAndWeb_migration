"use client";

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { LogOut, Home, FileText, Share2, Shield, User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'documents' | 'sharing' | 'profile') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: Array<{
    key: 'home' | 'documents' | 'sharing' | 'profile';
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { key: 'documents', label: 'Vault', icon: <FileText className="w-4 h-4" /> },
    { key: 'sharing', label: 'Sharing', icon: <Share2 className="w-4 h-4" /> },
    { key: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

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

          <div className="hidden md:flex gap-4">
            {tabs.map((tab) => (
              <NavButton
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#1e2b48] text-white border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
                <SheetDescription className="text-white/70">
                  Navigate to Home, Vault, Sharing, and Profile.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                {tabs.map((tab) => (
                  <NavButton
                    key={`mobile-${tab.key}`}
                    active={activeTab === tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setIsMobileMenuOpen(false);
                    }}
                    icon={tab.icon}
                    label={tab.label}
                    className="w-full justify-start"
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>

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

const NavButton = ({
  active,
  onClick,
  icon,
  label,
  className,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${className ?? ''} ${
      active ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);
