"use client";

import React, { useEffect, useRef, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Navbar } from '@/components/dashboard/Navbar';
import { Home } from '@/components/dashboard/Home';
import { Vault } from '@/components/dashboard/Vault';
import { Profile } from '@/components/dashboard/Profile';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { authWithGoogleCode, fetchProfile, saveProfile } from '@/lib/api';
import { isFirebaseConfigured } from '@/firebase/config';
import LandingPage from '@/components/landing/LandingPage';

const TOKEN_KEY = 'sabapplier_token';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: 'popup';
            callback: (response: { code?: string; error?: string }) => void;
          }) => { requestCode: () => void };
        };
      };
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'documents' | 'sharing' | 'profile'>('home');
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleClientReady, setIsGoogleClientReady] = useState(false);
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    const initialize = () => {
      if (!window.google?.accounts?.oauth2) return;
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response) => {
          try {
            if (response.error || !response.code) {
              throw new Error(response.error || 'Google authorization failed');
            }
            const authResult = await authWithGoogleCode(response.code);
            localStorage.setItem(TOKEN_KEY, authResult.token);

            // Sync with SabApplier Extension
            localStorage.setItem('sabapplier_extension_jwt', authResult.token);
            localStorage.setItem('sabapplier_extension_user', JSON.stringify(authResult.user));
            localStorage.setItem('sabapplier_extension_sync_timestamp', Date.now().toString());

            setToken(authResult.token);
            setProfile(authResult.user);
          } catch (error) {
            console.error('Login failed', error);
          }
        },
      });
      setIsGoogleClientReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      initialize();
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [googleClientId]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    setToken(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchProfile(token)
      .then((res) => {
        if (!cancelled) {
          setProfile(res.user);
          // Ensure extension data is fresh on profile fetch
          localStorage.setItem('sabapplier_extension_user', JSON.stringify(res.user));
          localStorage.setItem('sabapplier_extension_sync_timestamp', Date.now().toString());
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);

          // Clear Extension Sync Data
          localStorage.removeItem('sabapplier_extension_jwt');
          localStorage.removeItem('sabapplier_extension_user');
          localStorage.removeItem('sabapplier_extension_sync_timestamp');

          setToken(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleLogin = async () => {
    if (!googleClientId) {
      console.error('Google OAuth config missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
      return;
    }
    if (!codeClientRef.current) {
      console.error('Google OAuth client not ready yet.');
      return;
    }
    codeClientRef.current.requestCode();
  };

  const handleLogout = async () => {
    localStorage.removeItem(TOKEN_KEY);

    // Clear Extension Sync Data
    localStorage.removeItem('sabapplier_extension_jwt');
    localStorage.removeItem('sabapplier_extension_user');
    localStorage.removeItem('sabapplier_extension_sync_timestamp');

    // Set logout flag for extension
    localStorage.setItem('sabapplier_extension_logout', 'true');
    localStorage.setItem('sabapplier_extension_logout_timestamp', Date.now().toString());

    // Remove logout flag after delay
    setTimeout(() => {
      localStorage.removeItem('sabapplier_extension_logout');
      localStorage.removeItem('sabapplier_extension_logout_timestamp');
    }, 5000);

    setToken(null);
    setProfile(null);
  };

  const persistUser = async (updated: UserProfile) => {
    if (!token) return;
    setProfile(updated);
    try {
      const {
        userId: _userId,
        googleId: _googleId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...mutablePatch
      } = updated as any; // Cast to any to handle extra fields from backend
      const saved = await saveProfile(token, mutablePatch);
      setProfile(saved.user);
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!token || !profile) {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (!profile.onboardingComplete) {
    return (
      <OnboardingWizard
        userId={profile.userId}
        authToken={token}
        user={profile}
        saveUser={persistUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {activeTab === 'home' && <Home user={profile} />}
        {activeTab === 'documents' && (
          <Vault userId={profile.userId} authToken={token} user={profile} saveUser={persistUser} />
        )}
        {activeTab === 'profile' && <Profile user={profile} saveUser={persistUser} />}
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
