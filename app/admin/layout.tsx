"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { getAlerts, updateMembershipAlerts } from "@/lib/storage"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const updateAlerts = async () => {
      await updateMembershipAlerts()
      const alerts = await getAlerts()
      const criticalAlerts = alerts.filter(
        (alert) => alert.alertType === "expired" || alert.daysRemaining <= 7
      )
      setAlertCount(criticalAlerts.length)
    }
  
    updateAlerts()
    const interval = setInterval(updateAlerts, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return <AdminLayout alertCount={alertCount}>{children}</AdminLayout>
}
