"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentAdmin } from "@/lib/auth"
import type { Admin } from "@/lib/types"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("manager" | "staff")[]
  fallbackPath?: string
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/admin" }: RoleGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      try {
        const currentAdmin = getCurrentAdmin()
        
        if (!currentAdmin) {
          router.push("/login")
          return
        }

        if (allowedRoles.includes(currentAdmin.role)) {
          setHasAccess(true)
        } else {
          router.push(fallbackPath)
        }
      } catch (error) {
        console.error("Error checking role access:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [allowedRoles, fallbackPath, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
