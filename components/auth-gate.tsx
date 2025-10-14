"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const authed = isAuthenticated()
    if (!authed) {
      router.replace("/login")
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null

  return <>{children}</>
}
