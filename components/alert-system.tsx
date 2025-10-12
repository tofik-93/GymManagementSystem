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

export function AlertSystem() {
  const [alerts, setAlerts] = useState<MembershipAlert[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
    // Auto-refresh alerts every minute
    const interval = setInterval(loadAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = () => {
    updateMembershipAlerts()
    const currentAlerts = getAlerts()
    setAlerts(currentAlerts)
  }

  const refreshAlerts = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadAlerts()
    setIsRefreshing(false)
    toast({
      title: "Alerts Refreshed",
      description: "Membership alerts have been updated.",
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
      title: "Membership Renewed",
      description: `${member.name}'s membership has been renewed successfully.`,
    })
  }

  const dismissAlert = (alertId: string) => {
    // In a real app, you'd mark the alert as dismissed in storage
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    toast({
      title: "Alert Dismissed",
      description: "Alert has been removed from the list.",
    })
  }

  const getAlertPriority = (alert: MembershipAlert) => {
    if (alert.alertType === "expired") {
      return { priority: "high", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
    } else if (alert.daysRemaining <= 7) {
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
    warning: alerts.filter(
      (alert) => alert.alertType === "expiring" && alert.daysRemaining > 7 && alert.daysRemaining <= 14,
    ),
    info: alerts.filter((alert) => alert.alertType === "expiring" && alert.daysRemaining > 14),
  }

  const totalCriticalAlerts = groupedAlerts.expired.length + groupedAlerts.critical.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Alert System</h2>
            <p className="text-muted-foreground">30-day membership expiration alerts</p>
          </div>
          {totalCriticalAlerts > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalCriticalAlerts} Critical
            </Badge>
          )}
        </div>
        <Button onClick={refreshAlerts} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedAlerts.expired.length}</div>
            <p className="text-xs text-red-600">Memberships expired</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedAlerts.critical.length}</div>
            <p className="text-xs text-red-600">Expiring in 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{groupedAlerts.warning.length}</div>
            <p className="text-xs text-orange-600">Expiring in 8-14 days</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{groupedAlerts.info.length}</div>
            <p className="text-xs text-yellow-600">Expiring in 15-30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* No Alerts Message */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">All Clear!</h3>
            <p className="text-muted-foreground text-center">
              No membership alerts at this time. All memberships are in good standing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alert Lists */}
      {alerts.length > 0 && (
        <div className="space-y-6">
          {/* Expired Memberships */}
          {groupedAlerts.expired.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Expired Memberships - Immediate Action Required
                </CardTitle>
                <CardDescription>These memberships have already expired and need immediate renewal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAlerts.expired.map((alert) => {
                  const priority = getAlertPriority(alert)
                  return (
                    <Alert key={alert.id} className={`${priority.borderColor} ${priority.bgColor}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{alert.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expired {Math.abs(alert.daysRemaining)} days ago
                          </div>
                          <Badge variant="destructive">EXPIRED</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => renewMembershipFromAlert(alert)}>
                            Renew Now
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => dismissAlert(alert.id)}>
                            Dismiss
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Critical Alerts */}
          {groupedAlerts.critical.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Critical Alerts - Expiring Within 7 Days
                </CardTitle>
                <CardDescription>These memberships require urgent attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAlerts.critical.map((alert) => {
                  const priority = getAlertPriority(alert)
                  return (
                    <Alert key={alert.id} className={`${priority.borderColor} ${priority.bgColor}`}>
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{alert.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expires in {alert.daysRemaining} days
                          </div>
                          <Badge variant="destructive">CRITICAL</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => renewMembershipFromAlert(alert)}>
                            Renew
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => dismissAlert(alert.id)}>
                            Dismiss
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Warning Alerts */}
          {groupedAlerts.warning.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Warning - Expiring in 8-14 Days
                </CardTitle>
                <CardDescription>Plan renewal for these memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAlerts.warning.map((alert) => {
                  const priority = getAlertPriority(alert)
                  return (
                    <Alert key={alert.id} className={`${priority.borderColor} ${priority.bgColor}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{alert.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expires in {alert.daysRemaining} days
                          </div>
                          <Badge variant="outline">WARNING</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => renewMembershipFromAlert(alert)}>
                            Renew
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                            Dismiss
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Info Alerts */}
          {groupedAlerts.info.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Information - Expiring in 15-30 Days
                </CardTitle>
                <CardDescription>Early notification for upcoming renewals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedAlerts.info.map((alert) => {
                  const priority = getAlertPriority(alert)
                  return (
                    <Alert key={alert.id} className={`${priority.borderColor} ${priority.bgColor}`}>
                      <Bell className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{alert.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expires in {alert.daysRemaining} days
                          </div>
                          <Badge variant="secondary">INFO</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => renewMembershipFromAlert(alert)}>
                            Renew
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                            Dismiss
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
