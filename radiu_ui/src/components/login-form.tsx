// components/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, Loader2, Shield } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { signInwithemail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setAlert({ type: "error", message: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    const result = await signInwithemail(email.trim());

    if (result.success) {
      setAlert({ type: "success", message: result.message });
    } else {
      setAlert({ type: "error", message: result.message });
    }

    setIsLoading(false);
  };

  return (
    <div className="">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Enter your email to sign in with OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alert && (
            <Alert
              variant={alert.type === "success" ? "default" : "destructive"}
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>We&apos;ll send a one-time password to your email</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
