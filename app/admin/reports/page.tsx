"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMembers, getDashboardStats } from "@/lib/storage"
import type { Member, DashboardStats } from "@/lib/types"
import { BarChart3, TrendingUp, Users, Calendar, Download, RefreshCw } from "lucide-react"

export default function ReportsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    expiringMembers: 0,
    monthlyRevenue: 0,
    newMembersThisMonth: 0,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    const allMembers = await getMembers()
    const dashboardStats = await getDashboardStats()
    setMembers(allMembers)
    setStats(dashboardStats)
  }
  

  const refreshReports = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadReportData()
    setIsRefreshing(false)
  }

  const getMembershipTypeStats = () => {
    const monthly = members.filter((m) => m.membershipType === "monthly").length
    const quarterly = members.filter((m) => m.membershipType === "quarterly").length
    const yearly = members.filter((m) => m.membershipType === "yearly").length
    return { monthly, quarterly, yearly }
  }

  const getJoinTrends = () => {
    const last6Months = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      const count = members.filter((m) => {
        const joinDate = new Date(m.joinDate)
        return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear()
      }).length
      last6Months.push({ month: monthName, count })
    }

    return last6Months
  }

  const membershipTypeStats = getMembershipTypeStats()
  const joinTrends = getJoinTrends()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into gym performance and member analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshReports} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">Currently active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalMembers > 0 ? Math.round((stats.newMembersThisMonth / stats.totalMembers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">New members this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Active vs total members</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Type Distribution</CardTitle>
          <CardDescription>Breakdown of membership types across all members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{membershipTypeStats.monthly}</div>
              <div className="text-sm text-muted-foreground">Monthly Members</div>
              <Badge variant="outline" className="mt-2">
                $50/month
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{membershipTypeStats.quarterly}</div>
              <div className="text-sm text-muted-foreground">Quarterly Members</div>
              <Badge variant="outline" className="mt-2">
                $40/month
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{membershipTypeStats.yearly}</div>
              <div className="text-sm text-muted-foreground">Yearly Members</div>
              <Badge variant="outline" className="mt-2">
                $35/month
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Join Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Member Join Trends</CardTitle>
          <CardDescription>New member registrations over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {joinTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-medium">{trend.month}</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.max((trend.count / Math.max(...joinTrends.map((t) => t.count))) * 100, 5)}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium w-8 text-right">{trend.count}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Status Overview</CardTitle>
            <CardDescription>Current status of all gym members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Members</span>
              <Badge variant="default">{stats.activeMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Expiring Soon</span>
              <Badge variant="outline">{stats.expiringMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Expired Members</span>
              <Badge variant="destructive">{stats.expiredMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>New This Month</span>
              <Badge variant="secondary">{stats.newMembersThisMonth}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Monthly revenue by membership type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Monthly Plans</span>
              <span className="font-medium">${membershipTypeStats.monthly * 50}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Quarterly Plans</span>
              <span className="font-medium">${membershipTypeStats.quarterly * 40}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Yearly Plans</span>
              <span className="font-medium">${membershipTypeStats.yearly * 35}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total Monthly Revenue</span>
                <span className="text-primary">${stats.monthlyRevenue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
