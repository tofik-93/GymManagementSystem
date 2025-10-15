"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats, initializeDefaultAdmin } from "@/lib/storage"
import type { DashboardStats } from "@/lib/types"
import { Users, UserCheck, UserX, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    expiringMembers: 0,
    monthlyRevenue: 0,
    newMembersThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        await initializeDefaultAdmin() // ensure default admin exists
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (err) {
        console.error("Failed to load dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    { title: "Total Members", value: stats.totalMembers, description: "All registered members", icon: Users, color: "text-blue-600" },
    { title: "Active Members", value: stats.activeMembers, description: "Currently active memberships", icon: UserCheck, color: "text-green-600" },
    { title: "Expiring Soon", value: stats.expiringMembers, description: "Memberships expiring in 30 days", icon: AlertTriangle, color: "text-yellow-600" },
    { title: "Expired Members", value: stats.expiredMembers, description: "Memberships that have expired", icon: UserX, color: "text-red-600" },
    { title: "Monthly Revenue", value: `ETB ${stats.monthlyRevenue}`, description: "Estimated monthly income", icon: DollarSign, color: "text-primary" },
    { title: "New This Month", value: stats.newMembersThisMonth, description: "New members joined this month", icon: TrendingUp, color: "text-purple-600" },
  ]

  if (loading) return <p className="text-center text-muted-foreground">Loading dashboard stats...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
