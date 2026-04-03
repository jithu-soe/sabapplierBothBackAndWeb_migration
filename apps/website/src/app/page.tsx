"use client";

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardTab, UserProfile, ActivitySummary } from '@/lib/types';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Home } from '@/components/dashboard/Home';
import { Vault } from '@/components/dashboard/Vault';
import { Profile } from '@/components/dashboard/Profile';
import { Activity } from '@/components/dashboard/Activity';
import { Pricing } from '@/components/dashboard/Pricing';
import { Sharing } from '@/components/dashboard/Sharing';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { authWithGoogleCode, deleteProfile, fetchActivitySessions, fetchProfile, saveProfile, syncMonthlySubscription } from '@/lib/api';
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

function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [profileEditIntent, setProfileEditIntent] = useState<'none' | 'founder'>('none');
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleClientReady, setIsGoogleClientReady] = useState(false);
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null);
  const hasAutoLoginTriggeredRef = useRef(false);
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
            
            // Show loading spinner while backend authenticates the code
            setLoading(true);
            
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
            setLoading(false);
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
    if (typeof window === 'undefined') return;

    const syncTokenFromStorage = () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored !== token) {
        setToken(stored);
      }
    };

    syncTokenFromStorage();
    const intervalId = window.setInterval(syncTokenFromStorage, 1500);
    const onFocus = () => syncTokenFromStorage();
    const onAuthSync = () => syncTokenFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === 'sabapplier_extension_jwt') {
        syncTokenFromStorage();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    window.addEventListener('sabapplier-auth-sync', onAuthSync as EventListener);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sabapplier-auth-sync', onAuthSync as EventListener);
    };
  }, [token]);

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

  useEffect(() => {
    if (!token || !profile) return;

    let cancelled = false;
    // Initial fetch of activity summary to sync credits in header/sidebar
    fetchActivitySessions(token, { pageSize: 1 })
      .then((res) => {
        if (!cancelled) {
          setActivitySummary(res.summary);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch activity summary', err);
      });

    return () => {
      cancelled = true;
    };
  }, [token, profile]);

  useEffect(() => {
    if (hasAutoLoginTriggeredRef.current) return;
    if (loading || token || profile) return;
    if (!isGoogleClientReady || !codeClientRef.current) return;

    const authParam = searchParams.get('auth');
    if (authParam !== 'google') return;

    hasAutoLoginTriggeredRef.current = true;
    codeClientRef.current.requestCode();
  }, [isGoogleClientReady, loading, profile, searchParams, token]);

  const handleLogin = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      router.push('/signin');
    }
  };

  const handleSignup = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      router.push('/signup');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem(TOKEN_KEY);

    // Clear Extension Sync Data
    localStorage.removeItem('sabapplier_extension_jwt');
    localStorage.removeItem('sabapplier_extension_user');
    localStorage.removeItem('sabapplier_extension_sync_timestamp');

    // Set logout flag for extension (so background sync clears extension auth)
    localStorage.setItem('sabapplier_extension_logout', 'true');
    localStorage.setItem('sabapplier_extension_logout_timestamp', Date.now().toString());

    // Notify extension immediately so it logs out without waiting for 30s poll
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabapplier-website-logout'));
    }

    // Remove logout flag after delay (fallback cleanup; extension also clears them when it processes)
    setTimeout(() => {
      localStorage.removeItem('sabapplier_extension_logout');
      localStorage.removeItem('sabapplier_extension_logout_timestamp');
    }, 5000);

    setToken(null);
    setProfile(null);
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    try {
      await deleteProfile(token);
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Failed to delete account. Please make sure the server is running and try again.');
      return;
    }

    // Clear website auth
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('sabapplier_extension_jwt');
    localStorage.removeItem('sabapplier_extension_user');
    localStorage.removeItem('sabapplier_extension_sync_timestamp');

    // Set logout flag for the background 30s poll (no auto-cleanup — bg script clears it)
    localStorage.setItem('sabapplier_extension_logout', 'true');
    localStorage.setItem('sabapplier_extension_logout_timestamp', Date.now().toString());

    // Instantly notify extension via content-script relay (no waiting for 30s poll)
    window.dispatchEvent(new CustomEvent('sabapplier-account-deleted'));

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
        creditPlan: _creditPlan,
        creditPlanExpiresAt: _creditPlanExpiresAt,
        purchasedCredits: _purchasedCredits,
        purchasedCreditsExpiresAt: _purchasedCreditsExpiresAt,
        freeCreditsAwarded: _freeCreditsAwarded,
        pendingCreditPurchaseType: _pendingCreditPurchaseType,
        pendingCreditPurchaseCreatedAt: _pendingCreditPurchaseCreatedAt,
        processedRazorpayPaymentIds: _processedRazorpayPaymentIds,
        processedRazorpayEventIds: _processedRazorpayEventIds,
        razorpaySubscriptionId: _razorpaySubscriptionId,
        razorpaySubscriptionShortUrl: _razorpaySubscriptionShortUrl,
        razorpaySubscriptionPlanId: _razorpaySubscriptionPlanId,
        subscriptionStatus: _subscriptionStatus,
        subscriptionCurrentStart: _subscriptionCurrentStart,
        subscriptionCurrentEnd: _subscriptionCurrentEnd,
        ...mutablePatch
      } = updated as any; // Cast to any to handle extra fields from backend
      const saved = await saveProfile(token, mutablePatch);
      setProfile(saved.user);

      // Always keep extension localStorage in sync with latest profile
      localStorage.setItem('sabapplier_extension_user', JSON.stringify(saved.user));
      localStorage.setItem('sabapplier_extension_sync_timestamp', Date.now().toString());

      // When onboarding completes, instantly notify the extension
      if (saved.user.onboardingComplete && !updated.onboardingComplete) {
        window.dispatchEvent(new CustomEvent('sabapplier-onboarding-complete'));
      }
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
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
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
    <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden">
      <Sidebar
        user={profile}
        summary={activitySummary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      <div className="flex-1 lg:ml-[280px] w-full min-w-0 flex flex-col min-h-screen pt-16">
        <DashboardHeader 
          user={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          summary={activitySummary}
        />
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10">
        {activeTab === 'home' && <Home user={profile} />}
        {activeTab === 'activity' && (
          <Activity
            authToken={token}
            countryCode={profile.countryCode}
            user={profile}
            summary={activitySummary}
            onSummaryUpdate={setActivitySummary}
          />
        )}
        {activeTab === 'pricing' && (
          <Pricing
            authToken={token}
            user={profile}
            onUserSnapshot={persistUser}
            onBillingRefresh={async ({ syncSubscription } = {}) => {
              if (syncSubscription) {
                try {
                  const res = await syncMonthlySubscription(token);
                  setProfile(res.user);
                  return { user: res.user, summary: null };
                } catch (err) {
                  console.error(err);
                }
              }
              const profileRes = await fetchProfile(token);
              setProfile(profileRes.user);
              return { user: profileRes.user, summary: null };
            }}
          />
        )}
        {activeTab === 'documents' && (
          <Vault
            authToken={token}
            user={profile}
            saveUser={persistUser}
            onEditFounderDetails={() => {
              setProfileEditIntent('founder');
              setActiveTab('profile');
            }}
          />
        )}
        {activeTab === 'profile' && (
          <Profile
            user={profile}
            saveUser={persistUser}
            onDeleteAccount={handleDeleteAccount}
            autoOpenFounderEditor={profileEditIntent === 'founder'}
            onAutoOpenHandled={() => setProfileEditIntent('none')}
          />
        )}
        {activeTab === 'sharing' && (
          <Sharing user={profile} />
        )}
        </main>

        <footer className="max-w-[1600px] mx-auto w-full px-6 py-8 mt-auto border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" /> Sabapplier AI Identity Vault
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Security</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Help</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
