"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialize: (config: any) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function GoogleAuth() {
  const {
    signIn,
    setCurrentEmail,
    setCurrentName,
    setCurrentPicture,
    setShowOtpModal,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured");
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleButton();
      script.onerror = () => setError("Failed to load Google Sign-in script");
      document.head.appendChild(script);
    } else {
      initializeGoogleButton();
    }
  }, []);

  // Initialize the Google button
  const initializeGoogleButton = () => {
    if (!window.google?.accounts?.id) {
      setError("Google Identity Services not loaded yet");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "100%",
        });
      }

      setIsGoogleLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Google Sign-in initialization error:", err);
      setError("Failed to initialize Google Sign-in");
    }
  };

  const sendOtp = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });

      return res.ok;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      return false;
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleResponse = async (response: any) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      setCurrentEmail(payload.email);
      setCurrentName(payload.name);
      setCurrentPicture(payload.picture);
      await sendOtp(payload?.email);
      setShowOtpModal(true);
    } catch (err) {
      console.error("Failed to parse Google credential response:", err);
      setError("Google sign-in failed");
    }
  };

  const handleFallbackSignIn = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error("Fallback sign-in failed:", err);
      setError("Sign-in failed");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={googleButtonRef} className="w-full min-h-[44px]" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!isGoogleLoaded && (
        <Button onClick={handleFallbackSignIn}>
          Continue with Demo Account
        </Button>
      )}
    </div>
  );
}
