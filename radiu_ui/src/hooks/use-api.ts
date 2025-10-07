// hooks/useApi.ts
"use client";

import { useState, useCallback } from "react";
import { User, AuthResponse, ApiError } from "@/types/api";

interface UseApiReturn {
  loading: boolean;
  error: string | null;

  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (
    email: string,
    otp: string,
    name?: string,
    picture?: string
  ) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;

  clearError: () => void;
}

export const useApi = ( setUser?: (user: User) => void, setShowOtpModal?: (show: boolean) => void ): UseApiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api ";

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendOtp = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        setError(errorData.error || "Failed to send OTP");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError("Network error: Failed to send OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    name?: string,
    picture?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      let currentName = name;
      let currentPicture = picture;

      if (!currentName || !currentPicture) {
        try {
          const storedUser = localStorage.getItem("radiu_ai_user");
          if (storedUser) {
            const userData: User = JSON.parse(storedUser);
            currentName = currentName || userData.name;
            currentPicture = currentPicture || userData.picture;
          }
        } catch (e) {
          console.warn("Failed to get user data from localStorage");
        }
      }

      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          name: currentName,
          picture: currentPicture,
        }),
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();

        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture || currentPicture,
        };

        console.log("[useApi] User data after OTP verification:", userData);

        // Update user state if setter provided
        if (setUser) {
          setUser(userData);
        }

        // Store in localStorage
        localStorage.setItem("radiu_ai_user", JSON.stringify(userData));
        localStorage.setItem("radiu_ai_token", data.token);

        // Close OTP modal if setter provided
        if (setShowOtpModal) {
          setShowOtpModal(false);
        }

        return true;
      } else {
        const errorData: ApiError = await res.json();
        const errorMessage = errorData.error || "OTP verification failed";
        setError(errorMessage);
        console.error("OTP verification failed:", errorMessage);
        return false;
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      setError("Network error: Failed to verify OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Get current user data from localStorage
      let currentName: string | undefined;
      let currentPicture: string | undefined;

      try {
        const storedUser = localStorage.getItem("radiu_ai_user");
        if (storedUser) {
          const userData: User = JSON.parse(storedUser);
          currentName = userData.name;
          currentPicture = userData.picture;
        }
      } catch (e) {
        console.warn("Failed to get user data from localStorage for resend");
      }

      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: currentName,
          picture: currentPicture,
        }),
      });

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        setError(errorData.error || "Failed to resend OTP");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      setError("Network error: Failed to resend OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendOtp,
    verifyOtp,
    resendOtp,
    clearError,
  };
};
