"use client";

import { useEffect, useRef, useState } from 'react';

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
            callback: (response: GoogleAuthResponse) => void;
          }) => { requestCode: () => void };
        };
      };
    };
  }
}

export interface GoogleAuthResponse {
  code?: string;
  error?: string;
}

interface UseGoogleAuthProps {
  onSuccess: (code: string) => void;
  onError?: (error: string) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps) {
  const [isReady, setIsReady] = useState(false);
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
        callback: (response: GoogleAuthResponse) => {
          if (response.error || !response.code) {
            onError?.(response.error || 'Google authorization failed');
          } else {
            onSuccess(response.code);
          }
        },
      });
      setIsReady(true);
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
  }, [googleClientId, onSuccess, onError]);

  const showPopup = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    } else {
      console.error('Google Auth Client not ready');
    }
  };

  return { isReady, showPopup };
}
