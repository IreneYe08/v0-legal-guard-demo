"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthStore {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: "google" | "github") => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated (from localStorage)
    const storedUser = localStorage.getItem("lg_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockUser = { id: "1", email, name: email.split("@")[0] }
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("lg_user", JSON.stringify(mockUser))

      // Track event
      track("lg_auth_login_ok", { method: "email" })
    } catch (error) {
      track("lg_auth_login_fail", { method: "email" })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockUser = { id: "1", email, name: email.split("@")[0] }
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("lg_user", JSON.stringify(mockUser))

      // Track event
      track("lg_auth_signup_ok", { method: "email" })
    } catch (error) {
      track("lg_auth_signup_fail", { method: "email" })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithProvider = async (provider: "google" | "github") => {
    setIsLoading(true)
    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockUser = { id: "1", email: `user@${provider}.com`, name: `${provider} User` }
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("lg_user", JSON.stringify(mockUser))

      // Track event
      track("lg_auth_login_ok", { method: provider })
    } catch (error) {
      track("lg_auth_login_fail", { method: provider })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendMagicLink = async (email: string) => {
    setIsLoading(true)
    try {
      // Simulate sending magic link
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Track event
      track("lg_auth_magic_link_sent", { email })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("lg_user")

    // Track event
    track("lg_auth_logout", {})
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        loginWithProvider,
        sendMagicLink,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Track function stub
function track(event: string, payload: Record<string, unknown>) {
  console.log("[v0] Track:", event, payload)
}
