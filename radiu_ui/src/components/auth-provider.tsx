"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  showOtpModal: boolean;
  setShowOtpModal: (show: boolean) => void;
  currentEmail: string;
  setCurrentEmail: (email: string) => void;
  currentName: string;
  setCurrentName: (name: string) => void;
  currentPicture: string;
  setCurrentPicture: (picture: string) => void;
  verifyOtp: (email: string, otp: string, name?: string, picture?: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [currentPicture, setCurrentPicture] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("radiu_ai_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("[v0] Restored user from localStorage:", userData);
        setUser(userData);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("radiu_ai_user");
      }
    }

    const initializeGoogleSignIn = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          console.log("[v0] No Google Client ID found");
          setIsLoading(false);
          return;
        }

        // Load Google Identity Services
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.google) {
            console.log("[v0] Google Identity Services loaded");
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
          }
          setIsLoading(false);
        };

        script.onerror = () => {
          console.error("Failed to load Google Identity Services");
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Failed to initialize Google Sign-in:", error);
        setIsLoading(false);
      }
    };

    initializeGoogleSignIn();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("[v0] handleCredentialResponse called");

      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      console.log("[v0] Decoded payload:", payload);

      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };

      // Send OTP to the user's email with picture data
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          picture: userData.picture, // Send picture to backend
        }),
      });

      if (res.ok) {
        // Show OTP modal instead of automatically signing in
        setCurrentEmail(userData.email);
        setCurrentName(userData.name);
        setCurrentPicture(userData.picture);
        setShowOtpModal(true);
      } else {
        console.error("Failed to send OTP");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to process sign-in:", error);
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string, name?: string, picture?: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          name: name || currentName,
          picture: picture || currentPicture, // Send picture to backend
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture || currentPicture, // Use picture from backend or fallback
        };

        console.log("[v0] User data after OTP verification:", userData);

        setUser(userData);
        localStorage.setItem("radiu_ai_user", JSON.stringify(userData));
        localStorage.setItem("radiu_ai_token", data.token);
        setShowOtpModal(false);
        
        return true;
      } else {
        const errorData = await res.json();
        console.error("OTP verification failed:", errorData.error);
        return false;
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return false;
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: currentName,
          picture: currentPicture,
        }),
      });

      return res.ok;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      return false;
    }
  };

  const signIn = async () => {
    if (window.google) {
      console.log("[v0] Triggering Google Sign-in prompt");
      window.google.accounts.id.prompt();
    }
  };

  const signOut = () => {
    console.log("[v0] Signing out user");
    setUser(null);
    setCurrentPicture("");
    localStorage.removeItem("radiu_ai_user");
    localStorage.removeItem("radiu_ai_token");
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signOut,
      showOtpModal,
      setShowOtpModal,
      currentEmail,
      setCurrentEmail,
      currentName,
      setCurrentName,
      currentPicture,
      setCurrentPicture,
      verifyOtp,
      resendOtp
    }}>
      {children}
      <OtpVerificationModal />
    </AuthContext.Provider>
  );
}

// OTP Verification Modal Component
function OtpVerificationModal() {
  const { 
    showOtpModal, 
    setShowOtpModal, 
    currentEmail, 
    verifyOtp, 
    resendOtp,
    currentName,
    currentPicture 
  } = useAuth();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showOtpModal) {
      setOtp(["", "", "", "", "", ""]);
      setAlert(null);
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== "") && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedDigits = pastedData.replace(/\D/g, "").split("").slice(0, 6);
    
    if (pastedDigits.length === 6) {
      const newOtp = [...otp];
      pastedDigits.forEach((digit, index) => {
        newOtp[index] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    const success = await verifyOtp(currentEmail, otpString, currentName, currentPicture);
    
    if (success) {
      setAlert({ type: "success", message: "OTP verified successfully! Redirecting..." });
      // Auto redirect after success
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setAlert({ type: "error", message: "Invalid OTP. Please try again." });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    setAlert(null);

    const success = await resendOtp(currentEmail);
    
    if (success) {
      setAlert({ type: "success", message: "OTP resent successfully!" });
    } else {
      setAlert({ type: "error", message: "Failed to resend OTP. Please try again." });
    }
    
    setIsResending(false);
  };

  if (!showOtpModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Verify OTP</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOtpModal(false)}
              className="h-8 w-8"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentName}</p>
              <p className="text-sm text-muted-foreground truncate">{currentEmail}</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a 6-digit verification code to your email.
          </p>

          {alert && (
            <Alert variant={alert.type === "success" ? "default" : "destructive"} className="mb-4">
              {alert.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Terminal className="h-4 w-4" />
              )}
              <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-12 text-center text-lg font-semibold border-2 focus:border-primary transition-colors"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || otp.some(digit => digit === "")}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Didn't receive code? Resend OTP"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Global type declaration for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialize: (config: any) => void;
          prompt: () => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}