"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMembers, getDashboardStats, getSettings } from "@/lib/storage"
import type { Member, DashboardStats, GymSettings } from "@/lib/types"
import { BarChart3, TrendingUp, Users, Calendar, Download, RefreshCw } from "lucide-react"
import jsPDF from "jspdf"
import { getAdminLanguage } from "@/lib/auth"
import { translations } from "@/lib/language"

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
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [language, setLanguage] = useState<"en" | "am">(getAdminLanguage())
  const t = translations[language]

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    const [allMembers, dashboardStats, gymSettings] = await Promise.all([
      getMembers(),
      getDashboardStats(),
      getSettings(),
    ])
    setMembers(allMembers)
    setStats(dashboardStats)
    setSettings(gymSettings)
  }

  const refreshReports = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await loadReportData()
    setIsRefreshing(false)
  }
  const getRevenueByMembershipType = () => {
    const monthlyRevenue = members
      .filter((m) => m.membershipType === "monthly")
      .reduce((sum, m) => sum + (m.membershipTypeAmount || 0), 0)
  
    const quarterlyRevenue = members
      .filter((m) => m.membershipType === "quarterly")
      .reduce((sum, m) => sum + (m.membershipTypeAmount || 0), 0)
  
    const yearlyRevenue = members
      .filter((m) => m.membershipType === "yearly")
      .reduce((sum, m) => sum + (m.membershipTypeAmount || 0), 0)
  
    return { monthlyRevenue, quarterlyRevenue, yearlyRevenue }
  }
  const { monthlyRevenue, quarterlyRevenue, yearlyRevenue } = getRevenueByMembershipType()
  
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
      const monthName = date.toLocaleDateString(language === "en" ? "en-US" : "am-ET", { month: "short", year: "numeric" })
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

  const monthlyPrice = settings?.monthlyPrice ?? 0
  const quarterlyPrice = settings?.quarterlyPrice ?? 0
  const yearlyPrice = settings?.yearlyPrice ?? 0

  const exportReportDataToPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4")
    let y = 10
    pdf.setFontSize(16)
    pdf.text(t.gym_report, 105, y, { align: "center" })
    y += 10
    pdf.setFontSize(12)
    pdf.text(`${t.total_members}: ${stats.totalMembers}`, 10, y); y += 7
    pdf.text(`${t.active_members}: ${stats.activeMembers}`, 10, y); y += 7
    pdf.text(`${t.expiring_members}: ${stats.expiringMembers}`, 10, y); y += 7
    pdf.text(`${t.expired_members}: ${stats.expiredMembers}`, 10, y); y += 7
    pdf.text(`${t.new_members_this_month}: ${stats.newMembersThisMonth}`, 10, y); y += 10

    pdf.text(t.membership_distribution, 10, y); y += 7
    pdf.text(`${t.monthly_members}: ${membershipTypeStats.monthly}`, 10, y); y += 7
    pdf.text(`${t.quarterly_members}: ${membershipTypeStats.quarterly}`, 10, y); y += 7
    pdf.text(`${t.yearly_members}: ${membershipTypeStats.yearly}`, 10, y); y += 10

    pdf.text(t.revenue_breakdown, 10, y); y += 7
    pdf.text(`${t.monthly_plans}: ${membershipTypeStats.monthly * monthlyPrice}`, 10, y); y += 7
    pdf.text(`${t.quarterly_plans}: ${membershipTypeStats.quarterly * quarterlyPrice}`, 10, y); y += 7
    pdf.text(`${t.yearly_plans}: ${membershipTypeStats.yearly * yearlyPrice}`, 10, y); y += 7
    pdf.text(`${t.total_revenue}: ${stats.monthlyRevenue}`, 10, y); y += 10

    pdf.text(t.join_trends_last_6_months, 10, y); y += 7
    joinTrends.forEach((trend) => {
      pdf.text(`${trend.month}: ${trend.count}`, 10, y)
      y += 7
    })

    pdf.save(`${t.gym_report}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.reports_analytics}</h1>
          <p className="text-muted-foreground mt-2">{t.reports_analytics_desc}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshReports} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> {t.refresh}
          </Button>
          <Button onClick={exportReportDataToPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" /> {t.export_report}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.total_revenue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">ETB {stats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">{t.monthly_recurring_revenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.active_members}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">{t.currently_active_memberships}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.growth_rate}</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalMembers > 0 ? Math.round((stats.newMembersThisMonth / stats.totalMembers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{t.new_members_this_month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.retention_rate}</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{t.active_vs_total_members}</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t.membership_type_distribution}</CardTitle>
          <CardDescription>{t.membership_type_distribution_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{membershipTypeStats.monthly}</div>
              <div className="text-sm text-muted-foreground">{t.monthly_members}</div>
              <Badge variant="outline" className="mt-2">ETB {monthlyPrice}/month</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{membershipTypeStats.quarterly}</div>
              <div className="text-sm text-muted-foreground">{t.quarterly_members}</div>
              <Badge variant="outline" className="mt-2">ETB {quarterlyPrice}/month</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{membershipTypeStats.yearly}</div>
              <div className="text-sm text-muted-foreground">{t.yearly_members}</div>
              <Badge variant="outline" className="mt-2">ETB {yearlyPrice}/month</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Join Trends */}
      <Card>
        <CardHeader>
          <CardTitle>{t.member_join_trends}</CardTitle>
          <CardDescription>{t.new_member_registrations_last_6_months}</CardDescription>
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

      {/* Member Status & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.member_status_overview}</CardTitle>
            <CardDescription>{t.current_status_all_members}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>{t.active_members}</span>
              <Badge variant="default">{stats.activeMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.expiring_soon}</span>
              <Badge variant="outline">{stats.expiringMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.expired_members}</span>
              <Badge variant="destructive">{stats.expiredMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.new_this_month}</span>
              <Badge variant="secondary">{stats.newMembersThisMonth}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.revenue_breakdown}</CardTitle>
            <CardDescription>{t.monthly_revenue_by_type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
  <span>{t.monthly_plans}</span>
  <span className="font-medium">ETB {monthlyRevenue}</span>
</div>
<div className="flex justify-between items-center">
  <span>{t.quarterly_plans}</span>
  <span className="font-medium">ETB {quarterlyRevenue}</span>
</div>
<div className="flex justify-between items-center">
  <span>{t.yearly_plans}</span>
  <span className="font-medium">ETB {yearlyRevenue}</span>
</div>
<div className="border-t pt-4">
  <div className="flex justify-between items-center font-bold">
    <span>{t.total_monthly_revenue}</span>
    <span className="text-primary">
      ETB {monthlyRevenue + quarterlyRevenue + yearlyRevenue}
    </span>
  </div>
</div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
