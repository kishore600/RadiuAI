"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Chrome, TrendingUp, BarChart3, Users, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

export function GoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const { signIn } = useAuth()

  useEffect(() => {
    console.log("[v0] Google Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing")
  }, [])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured")
      return
    }

    const loadGoogleSignIn = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        if (window.google) {
          initializeGoogleButton()
        }
        return
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google) {
          initializeGoogleButton()
        }
      }
      script.onerror = () => {
        setError("Failed to load Google Sign-in")
      }
      document.head.appendChild(script)
    }

    const initializeGoogleButton = () => {
      try {
        console.log("[v0] Initializing Google Sign-in button")

        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = ""

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
          })
        }

        setIsGoogleLoaded(true)
        setError(null)
      } catch (err) {
        console.error("Google Sign-in initialization error:", err)
        setError("Failed to initialize Google Sign-in")
      }
    }

    loadGoogleSignIn()
  }, [])

  const handleFallbackSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn()
    } catch (error) {
      console.error("Sign-in failed:", error)
      setError("Sign-in failed")
    }
    setIsLoading(false)
  }
  console.log(isGoogleLoaded)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <Badge variant="secondary" className="gradient-bg text-white border-0 animate-pulse-glow">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI-Powered Market Intelligence
            </Badge>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              radiuAI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Professional retail market intelligence platform designed for sophisticated investors and analysts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="border-accent/20 hover:border-accent/40 transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: "0.1s" }}
            >
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Market Analysis</h3>
                <p className="text-sm text-muted-foreground">Real-time insights</p>
              </CardContent>
            </Card>

            <Card
              className="border-accent/20 hover:border-accent/40 transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Competitor Intel</h3>
                <p className="text-sm text-muted-foreground">Strategic positioning</p>
              </CardContent>
            </Card>

            <Card
              className="border-accent/20 hover:border-accent/40 transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: "0.3s" }}
            >
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">ROI Forecasting</h3>
                <p className="text-sm text-muted-foreground">Predictive modeling</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto animate-fade-in-up border-accent/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome to radiuAI</CardTitle>
            <CardDescription className="text-base">
              Sign in to access professional market intelligence tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* {isGoogleLoaded && !error && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && ( */}
              <div className="space-y-2">
                <div ref={googleButtonRef} className="w-full min-h-[44px]" />
                <p className="text-xs text-center text-muted-foreground">Secure sign-in with your Google account</p>
              </div>
            {/* )} */}

            {(error || !isGoogleLoaded || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) && (
              <div className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleFallbackSignIn}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 transition-all duration-300"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  {isLoading ? "Signing in..." : "Continue with Demo Account"}
                </Button>
              </div>
            )}

            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="text-center p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h4 className="font-semibold text-accent mb-2">Setup Required</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To enable Google Sign-in, add your Google Client ID:
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id</code>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Trusted by 10,000+ investment professionals</p>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Enterprise Security
                </Badge>
                <Badge variant="outline" className="text-xs">
                  SOC 2 Compliant
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
