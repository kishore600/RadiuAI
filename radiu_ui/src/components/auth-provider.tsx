"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  picture: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("radiu_ai_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log("[v0] Restored user from localStorage:", userData)
        setUser(userData)
        setIsLoading(false)
        return
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("radiu_ai_user")
      }
    }

    const initializeGoogleSignIn = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          console.log("[v0] No Google Client ID found")
          setIsLoading(false)
          return
        }

        // Load Google Identity Services
        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        script.onload = () => {
          if (window.google) {
            console.log("[v0] Google Identity Services loaded")
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            })
          }
          setIsLoading(false)
        }

        script.onerror = () => {
          console.error("Failed to load Google Identity Services")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to initialize Google Sign-in:", error)
        setIsLoading(false)
      }
    }

    initializeGoogleSignIn()
  }, [])

  const handleCredentialResponse = (response: any) => {
    try {
      console.log("[v0] handleCredentialResponse called")

      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]))
      console.log("[v0] Decoded payload:", payload)

      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      }

      console.log("[v0] Setting user data and saving to localStorage:", userData)
      setUser(userData)
      localStorage.setItem("radiu_ai_user", JSON.stringify(userData))
      setIsLoading(false)

      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error("Failed to process sign-in:", error)
      setIsLoading(false)
    }
  }

  const signIn = async () => {
    if (window.google) {
      console.log("[v0] Triggering Google Sign-in prompt")
      window.google.accounts.id.prompt()
    }
  }

  const signOut = () => {
    console.log("[v0] Signing out user")
    setUser(null)
    localStorage.removeItem("radiu_ai_user")
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
    window.location.reload()
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Global type declaration for Google Identity Services
declare global {
  interface Window {
    google: any
  }
}
