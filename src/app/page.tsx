"use client";

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Navbar } from '@/components/dashboard/Navbar';
import { Home } from '@/components/dashboard/Home';
import { Vault } from '@/components/dashboard/Vault';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'sabapplier_vault_session';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'documents' | 'sharing'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse session');
      }
    }
    setIsLoaded(true);
  }, []);

  const saveUser = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLogin = () => {
    const newUser: UserProfile = {
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      onboardingComplete: false,
      onboardingStep: 1,
      professions: [],
      documents: {}
    };
    saveUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-white text-center space-y-8">
          <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30">
            S
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">Sabapplier AI</h1>
            <p className="text-muted-foreground text-sm font-medium">Your Single Source of Truth</p>
          </div>
          <div className="space-y-4">
            <Button onClick={handleLogin} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-8 leading-relaxed">
              Complete your profile once. <br/> Auto-fill applications forever.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user.onboardingComplete) {
    return <OnboardingWizard user={user} saveUser={saveUser} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {activeTab === 'home' && <Home user={user} />}
        {activeTab === 'documents' && <Vault user={user} saveUser={saveUser} />}
        {activeTab === 'sharing' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-primary">Data Sharing Coming Soon</h2>
            <p className="text-muted-foreground max-w-sm">
              Securely share your verified vault data with universities, employers, and banks with a single OTP.
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" /> Sabapplier AI Identity Vault
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Security</a>
          <a href="#" className="hover:text-primary transition-colors">Help</a>
        </div>
      </footer>
    </div>
  );
}