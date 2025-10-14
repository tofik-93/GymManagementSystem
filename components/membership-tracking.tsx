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

export function MembershipTracking() {
  const [members, setMembers] = useState<Member[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    const allMembers = await getMembers()
    setMembers(allMembers)
  }

  const refreshMembershipData = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadMembers()
    setIsRefreshing(false)
    toast({
      title: "Data Refreshed",
      description: "Membership tracking data has been updated.",
    })
  }

  const renewMembership = (member: Member) => {
    const today = new Date()
    const newEndDate = new Date(today)

    // Calculate new end date based on membership type
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
      title: "Membership Renewed",
      description: `${member.name}'s membership has been renewed successfully.`,
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

    return {
      totalDays,
      daysElapsed: Math.max(daysElapsed, 0),
      daysRemaining,
      progressPercentage,
    }
  }

  const getMembershipStatusInfo = (member: Member) => {
    const progress = getMembershipProgress(member)

    if (!member.isActive) {
      return {
        status: "Inactive",
        icon: XCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        variant: "secondary" as const,
      }
    } else if (progress.daysRemaining < 0) {
      return {
        status: "Expired",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        variant: "destructive" as const,
      }
    } else if (progress.daysRemaining <= 7) {
      return {
        status: "Critical",
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        variant: "destructive" as const,
      }
    } else if (progress.daysRemaining <= 30) {
      return {
        status: "Expiring Soon",
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        variant: "outline" as const,
      }
    } else {
      return {
        status: "Active",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        variant: "default" as const,
      }
    }
  }

  const groupedMembers = {
    critical: members.filter((m) => {
      const progress = getMembershipProgress(m)
      return m.isActive && (progress.daysRemaining < 0 || progress.daysRemaining <= 7)
    }),
    expiring: members.filter((m) => {
      const progress = getMembershipProgress(m)
      return m.isActive && progress.daysRemaining > 7 && progress.daysRemaining <= 30
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
          <h2 className="text-2xl font-bold">Membership Tracking</h2>
          <p className="text-muted-foreground">Monitor membership status and renewal dates</p>
        </div>
        <Button onClick={refreshMembershipData} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedMembers.critical.length}</div>
            <p className="text-xs text-red-600">Expired or expiring in 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{groupedMembers.expiring.length}</div>
            <p className="text-xs text-yellow-600">Expiring in 8-30 days</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupedMembers.active.length}</div>
            <p className="text-xs text-green-600">More than 30 days left</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{groupedMembers.inactive.length}</div>
            <p className="text-xs text-gray-600">Suspended memberships</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tracking */}
      <div className="space-y-4">
        {/* Critical Members */}
        {groupedMembers.critical.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Critical - Immediate Attention Required
              </CardTitle>
              <CardDescription>Members with expired or critically expiring memberships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedMembers.critical.map((member) => {
                const progress = getMembershipProgress(member)
                const statusInfo = getMembershipStatusInfo(member)
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50/50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ends: {new Date(member.membershipEndDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {progress.daysRemaining < 0
                              ? `Expired ${Math.abs(progress.daysRemaining)} days ago`
                              : `${progress.daysRemaining} days left`}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress value={progress.progressPercentage} className="w-48 h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
                      <Button size="sm" onClick={() => renewMembership(member)}>
                        Renew Now
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon Members */}
        {groupedMembers.expiring.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Expiring Soon - Plan Renewals
              </CardTitle>
              <CardDescription>Members whose memberships expire within 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedMembers.expiring.map((member) => {
                const progress = getMembershipProgress(member)
                const statusInfo = getMembershipStatusInfo(member)
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ends: {new Date(member.membershipEndDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {progress.daysRemaining} days left
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress value={progress.progressPercentage} className="w-48 h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => renewMembership(member)}>
                        Renew
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Active Members Summary */}
        {groupedMembers.active.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Active Members ({groupedMembers.active.length})
              </CardTitle>
              <CardDescription>Members with more than 30 days remaining</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
