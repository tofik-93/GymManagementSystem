import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardStatsCards } from "@/components/dashboard-stats"
import { MembersTable } from "@/components/members-table"
import { ArrowLeft, UserPlus, Calendar, Bell } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background space-y-8">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your gym members and track performance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/alerts">
                  <Bell className="w-4 h-4 mr-2" />
                  View Alerts
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tracking">
                  <Calendar className="w-4 h-4 mr-2" />
                  Membership Tracking
                </Link>
              </Button>
              <Button asChild>
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
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <DashboardStatsCards />
        </section>

        {/* Members Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Member Directory</h2>
          <MembersTable />
        </section>
      </div>
    </div>
  )
}
