"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import apiClient from "./api-client"

interface User {
  id: number
  full_name: string
  name?: string
  email: string
  phone_number?: string
  role_id: number
  status: string
  created_at?: string
  updated_at?: string
  role?: {
    id: number
    role_name: string
    name?: string
    description?: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLeader: () => boolean
  isDepartmentLeader: () => boolean
  isClassLeader: () => boolean
  isTrainer: () => boolean
  isTrainee: () => boolean
  hasRole: (roleName: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = apiClient.getToken()
    if (token) {
      // Fetch current user data to verify token
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setUser(data.data)
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(data.data))
            }
          } else {
            // Token invalid, clear it
            apiClient.setToken(null)
            if (typeof window !== "undefined") {
              localStorage.removeItem("user")
            }
          }
        })
        .catch(() => {
          // Token invalid, clear it
          apiClient.setToken(null)
          if (typeof window !== "undefined") {
            localStorage.removeItem("user")
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      if (response.success && response.data) {
        setUser(response.data.user)
        // Persist user data to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await apiClient.logout()
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
  }

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser))
      } else {
        localStorage.removeItem("user")
      }
    }
  }

  const isLeader = () => user?.role?.role_name?.toLowerCase() === "leader"
  const isDepartmentLeader = () => user?.role?.role_name?.toLowerCase() === "department leader"
  const isClassLeader = () => user?.role?.role_name?.toLowerCase() === "class leader"
  const isTrainer = () => user?.role?.role_name?.toLowerCase() === "trainer"
  const isTrainee = () => user?.role?.role_name?.toLowerCase() === "trainee"
  const hasRole = (roleName: string) => user?.role?.role_name?.toLowerCase() === roleName.toLowerCase()

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser: handleSetUser,
        login,
        logout,
        isLeader,
        isDepartmentLeader,
        isClassLeader,
        isTrainer,
        isTrainee,
        hasRole,
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
