"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getMembers, saveMember } from "@/lib/storage"
import type { Member } from "@/lib/types"
import { Calendar, Clock, RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAdminLanguage } from "@/lib/auth"
import { translations } from "@/lib/language"

export function MembershipTracking() {
  const [members, setMembers] = useState<Member[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "am">(getAdminLanguage())
  const t = translations[language]
  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    const allMembers = await getMembers()
    setMembers(allMembers)
  }

  const refreshMembershipData = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadMembers()
    setIsRefreshing(false)
    toast({
      title: t.data_refreshed,
      description: t.membership_tracking_updated,
    })
  }

  const renewMembership = (member: Member) => {
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
    loadMembers()
    toast({
      title: t.membership_renewed,
      description: `${member.name} ${t.membership_renewed_success}`,
    })
  }

  const getMembershipProgress = (member: Member) => {
    const startDate = new Date(member.membershipStartDate)
    const endDate = new Date(member.membershipEndDate)
    const today = new Date()

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)

    return { totalDays, daysElapsed: Math.max(daysElapsed, 0), daysRemaining, progressPercentage }
  }

  const groupedMembers = {
    critical: members.filter((m) => {
      const progress = getMembershipProgress(m)
      return m.isActive && (progress.daysRemaining < 0 || progress.daysRemaining <= 7)
    }),
    expiring: members.filter((m) => {
      const progress = getMembershipProgress(m)
      return m.isActive && progress.daysRemaining > 7 && progress.daysRemaining <= 15
    }),
    active: members.filter((m) => {
      const progress = getMembershipProgress(m)
      return m.isActive && progress.daysRemaining > 30
    }),
    inactive: members.filter((m) => !m.isActive),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t.membership_tracking}</h2>
          <p className="text-muted-foreground">{t.membership_tracking_desc}</p>
        </div>
        <Button onClick={refreshMembershipData} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {t.refresh_data}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">{t.critical}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedMembers.critical.length}</div>
            <p className="text-xs text-red-600">{t.expired_or_7days}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">{t.expiring_soon}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{groupedMembers.expiring.length}</div>
            <p className="text-xs text-yellow-600">{t.expiring_in_30days}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">{t.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupedMembers.active.length}</div>
            <p className="text-xs text-green-600">{t.more_than_30days}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{t.inactive}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{groupedMembers.inactive.length}</div>
            <p className="text-xs text-gray-600">{t.suspended_memberships}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
