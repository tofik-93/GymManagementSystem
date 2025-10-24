"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardStatsCards } from "@/components/dashboard-stats"
import { MembersTable } from "@/components/members-table"
import { RoleGuard } from "@/components/role-guard"
import { getCurrentAdmin } from "@/lib/auth"
import { ArrowLeft, UserPlus, Calendar, Bell } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const currentAdmin = getCurrentAdmin()
    if (currentAdmin?.role === "staff") {
      router.replace("/admin/staff-dashboard")
    }
  }, [router])

  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="min-h-screen bg-background space-y-8">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          {/* Responsive Header Layout: On mobile, the main title and buttons stack. */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Side: Back Button & Title */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Button asChild variant="ghost" size="sm" className="w-fit">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="pt-2 md:pt-0"> {/* Added padding for separation on mobile */}
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your gym members and track performance</p>
              </div>
            </div>
            
            {/* Right Side: Action Buttons - Buttons wrap on smaller screens (flex-wrap) */}
            <div className="flex flex-wrap gap-2 justify-start md:justify-end mt-2 md:mt-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/alerts">
                  <Bell className="w-4 h-4 mr-2" />
                  View Alerts
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/tracking">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Membership Tracking</span>
                  <span className="sm:hidden">Tracking</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-8">
        {/* Dashboard Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          {/* DashboardStatsCards likely handles its internal responsiveness */}
          <DashboardStatsCards />
        </section>

        {/* Members Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Member Directory</h2>
          {/* MembersTable is expected to be a responsive data table */}
          <MembersTable />
        </section>
      </div>
    </div>
    </RoleGuard>
  )
}
