'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingPricing from '@/components/landing/LandingPricing';
import Footer from '@/components/landing/Footer';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { authWithGoogleCode } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const TOKEN_KEY = 'sabapplier_token';

export default function PricingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const { isReady, showPopup } = useGoogleAuth({
        onSuccess: async (code) => {
            try {
                setLoading(true);
                const authResult = await authWithGoogleCode(code);
                
                // Store auth details
                localStorage.setItem(TOKEN_KEY, authResult.token);
                localStorage.setItem('sabapplier_extension_jwt', authResult.token);
                localStorage.setItem('sabapplier_extension_user', JSON.stringify(authResult.user));
                localStorage.setItem('sabapplier_extension_sync_timestamp', Date.now().toString());

                // Redirect to dashboard
                router.push('/');
            } catch (error) {
                console.error('Login failed', error);
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Auth error:', error);
            setLoading(false);
        }
    });

    // Auto-trigger if coming from /signup redirect
    useEffect(() => {
        if (isReady && searchParams.get('auth') === 'google') {
            showPopup();
        }
    }, [isReady, searchParams, showPopup]);

    const handleLogin = () => {
        if (isReady) {
            showPopup();
        } else {
            router.push('/signin');
        }
    };

    const handleSignup = () => {
        if (isReady) {
            showPopup();
        } else {
            router.push('/signup');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#2F56C0] animate-spin" />
                </div>
            )}
            
            <LandingNavbar onLogin={handleLogin} onSignup={handleSignup} />
            
            {/* Added top padding to account for fixed navbar */}
            <main className="pt-16">
                <LandingPricing onSignup={handleSignup} />
            </main>

            <Footer />
        </div>
    );
}
