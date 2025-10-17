"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardStatsCards } from "@/components/dashboard-stats"
import { MembersTable } from "@/components/members-table"
import { ArrowLeft, UserPlus, Calendar, Bell } from "lucide-react"
import { translations } from "@/lib/language"
import { getAdminLanguage } from "@/lib/auth"

export default function AdminDashboard() {
  const [language, setLanguage] = useState<"en" | "am">("en")
  const t = translations[language]

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
  }, [])

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
                  {t.back_to_home}
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-primary">{t.admin_dashboard}</h1>
                <p className="text-muted-foreground">{t.manage_gym_members}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/alerts">
                  <Bell className="w-4 h-4 mr-2" />
                  {t.view_alerts}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tracking">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t.membership_tracking}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.add_member}
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
          <h2 className="text-xl font-semibold mb-4">{t.key_metrics}</h2>
          <DashboardStatsCards />
        </section>

        {/* Members Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.member_directory}</h2>
          <MembersTable />
        </section>
      </div>
    </div>
  )
}
