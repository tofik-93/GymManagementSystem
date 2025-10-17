"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAlerts, updateMembershipAlerts, getMembers, saveMember } from "@/lib/storage"
import type { MembershipAlert, Member } from "@/lib/types"
import { Bell, AlertTriangle, Clock, User, Calendar, RefreshCw, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/language"
import { getAdminLanguage } from "@/lib/auth"

export function AlertSystem() {
  const [alerts, setAlerts] = useState<MembershipAlert[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "am">("en")
  
  const t = translations[language]
  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    loadAlerts()
    const interval = setInterval(loadAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    updateMembershipAlerts()
    const currentAlerts = await getAlerts()
    setAlerts(currentAlerts)
  }

  const refreshAlerts = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadAlerts()
    setIsRefreshing(false)
    toast({
      title: t.alerts_refreshed,
      description: t.membership_alerts_updated,
    })
  }

  const renewMembershipFromAlert = (alert: MembershipAlert) => {
    const members = getMembers()
    const member = members.find((m) => m.id === alert.memberId)
    if (!member) return

    const today = new Date()
    const newEndDate = new Date(today)

    switch (member.membershipType) {
      case "monthly":
        newEndDate.setMonth(newEndDate.getMonth() + 1)
        break
      case "quarterly":
        newEndDate.setMonth(newEndDate.getMonth() + 3)
        break
      case "yearly":
        newEndDate.setFullYear(newEndDate.getFullYear() + 1)
        break
    }

    const updatedMember: Member = {
      ...member,
      membershipStartDate: today.toISOString().split("T")[0],
      membershipEndDate: newEndDate.toISOString().split("T")[0],
      isActive: true,
      updatedAt: new Date().toISOString(),
    }

    saveMember(updatedMember)
    loadAlerts()
    toast({
      title: t.membership_renewed,
      description: `${member.name} ${t.membership_renewed_success}`,
    })
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    toast({
      title: t.alert_dismissed,
      description: t.alert_removed,
    })
  }

  const getAlertPriority = (alert: MembershipAlert) => {
    if (alert.alertType === "expired" || alert.daysRemaining <= 7) {
      return { priority: "high", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
    } else if (alert.daysRemaining <= 14) {
      return { priority: "medium", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
    } else {
      return { priority: "low", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" }
    }
  }

  const groupedAlerts = {
    expired: alerts.filter((alert) => alert.alertType === "expired"),
    critical: alerts.filter((alert) => alert.alertType === "expiring" && alert.daysRemaining <= 7),
    warning: alerts.filter((alert) => alert.alertType === "expiring" && alert.daysRemaining > 7 && alert.daysRemaining <= 14),
    info: alerts.filter((alert) => alert.alertType === "expiring" && alert.daysRemaining > 14),
  }

  const totalCriticalAlerts = groupedAlerts.expired.length + groupedAlerts.critical.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.membership_alerts}</h1>
        <p className="text-muted-foreground mt-2">{t.monitor_membership_alerts}</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">{t.alert_system}</h2>
            <p className="text-muted-foreground">{t.expiration_alerts_30days}</p>
          </div>
          {totalCriticalAlerts > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalCriticalAlerts} {t.critical}
            </Badge>
          )}
        </div>
        <Button onClick={refreshAlerts} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t.expired}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedAlerts.expired.length}</div>
            <p className="text-xs text-red-600">{t.memberships_expired}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t.critical}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedAlerts.critical.length}</div>
            <p className="text-xs text-red-600">{t.expiring_7days}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">{t.warning}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{groupedAlerts.warning.length}</div>
            <p className="text-xs text-orange-600">{t.expiring_8_14days}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">{t.info}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{groupedAlerts.info.length}</div>
            <p className="text-xs text-yellow-600">{t.expiring_15_30days}</p>
          </CardContent>
        </Card>
      </div>

      {/* No Alerts */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">{t.all_clear}</h3>
            <p className="text-muted-foreground text-center">{t.no_membership_alerts}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
