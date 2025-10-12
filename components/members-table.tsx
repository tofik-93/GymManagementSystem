"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMembers, deleteMember } from "@/lib/storage"
import type { Member } from "@/lib/types"
import { Search, Edit, Trash2, Phone, Mail, Calendar, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadMembers = () => {
      const allMembers = getMembers()
      setMembers(allMembers)
      setFilteredMembers(allMembers)
    }

    loadMembers()
    // Refresh members every 30 seconds
    const interval = setInterval(loadMembers, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm),
    )
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to delete ${memberName}?`)) {
      deleteMember(memberId)
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      toast({
        title: "Member Deleted",
        description: `${memberName} has been removed from the system.`,
      })
    }
  }

  const getMembershipStatus = (member: Member) => {
    const today = new Date()
    const endDate = new Date(member.membershipEndDate)
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (!member.isActive) {
      return { status: "Inactive", variant: "secondary" as const, daysRemaining: 0 }
    } else if (daysRemaining < 0) {
      return { status: "Expired", variant: "destructive" as const, daysRemaining }
    } else if (daysRemaining <= 30) {
      return { status: "Expiring Soon", variant: "outline" as const, daysRemaining }
    } else {
      return { status: "Active", variant: "default" as const, daysRemaining }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Members Directory</CardTitle>
            <CardDescription>Manage all gym members and their information</CardDescription>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No members found matching your search." : "No members registered yet."}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const membershipStatus = getMembershipStatus(member)
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.photo || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <Badge variant={membershipStatus.variant}>{membershipStatus.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {membershipStatus.daysRemaining > 0
                          ? `${membershipStatus.daysRemaining} days left`
                          : membershipStatus.daysRemaining < 0
                            ? `Expired ${Math.abs(membershipStatus.daysRemaining)} days ago`
                            : "Expires today"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{member.membershipType} membership</p>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/members/${member.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
