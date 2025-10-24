"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMembers, getAlerts } from "@/lib/storage"
import type { Member, MembershipAlert } from "@/lib/types"
import { Users, Bell, Calendar, UserPlus, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/role-guard"
import { translations } from "@/lib/language"
import { getAdminLanguage } from "@/lib/auth"

export default function StaffDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [alerts, setAlerts] = useState<MembershipAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState<"en" | "am">("en")
  const t = translations[language]

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [membersData, alertsData] = await Promise.all([
          getMembers(),
          getAlerts()
        ])
        setMembers(membersData)
        setAlerts(alertsData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const activeMembers = members.filter(member => member.isActive).length
  const expiringMembers = alerts.filter(alert => alert.alertType === "expiring").length
  const expiredMembers = alerts.filter(alert => alert.alertType === "expired").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["staff"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.dashboard}</h1>
          <p className="text-muted-foreground mt-2">Manage gym members and track memberships</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeMembers} active members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringMembers}</div>
              <p className="text-xs text-muted-foreground">
                Need renewal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Bell className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredMembers}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Member
              </CardTitle>
              <CardDescription>Register a new gym member</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/register">Add Member</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                View Members
              </CardTitle>
              <CardDescription>Manage existing members</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/members">View Members</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alerts
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>View membership alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/alerts">View Alerts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tracking
              </CardTitle>
              <CardDescription>Track membership status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/tracking">View Tracking</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Membership alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{alert.memberName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.alertType === "expired" ? "Expired" : "Expiring in"} {Math.abs(alert.daysRemaining)} days
                      </p>
                    </div>
                    <Badge variant={alert.alertType === "expired" ? "destructive" : "secondary"}>
                      {alert.alertType === "expired" ? "Expired" : "Expiring"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/alerts">View All Alerts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  )
}
