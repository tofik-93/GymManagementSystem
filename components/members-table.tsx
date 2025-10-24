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
import { MemberEditModal } from "./edit-member"
import { translations } from "@/lib/language"
import { getAdminLanguage } from "@/lib/auth"

export function MembersTable() {
  const [language, setLanguage] = useState<"en" | "am">("en")
  const t = translations[language]
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const { toast } = useToast()
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    const loadMembers = async () => {
      const allMembers = await getMembers()
      setMembers(allMembers)
      setFilteredMembers(allMembers)
    }

    loadMembers()
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
    if (confirm(`${t.delete_member_confirm} ${memberName}?`)) {
      deleteMember(memberId)
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      toast({
        title: t.member_deleted,
        description: `${memberName} ${t.member_deleted_success}`,
      })
    }
  }
  // Simple Gregorian → Ethiopian date converter
function toEthiopianDate(date: Date): string {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588 // Gregorian to Julian Day Number
  const r = (jd - 1723856) % 1461
  const n = r % 365 + 365 * Math.floor(r / 1460)
  const year = 4 * Math.floor((jd - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460)
  const month = Math.floor(n / 30) + 1
  const day = (n % 30) + 1
  return `${day}/${month}/${year}` // Format: DD/MM/YYYY EC
}

  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsEditModalOpen(true)
  }

  const handleMemberUpdated = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  function daysBetweenDates(a: Date, b: Date): number {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.floor((utcB - utcA) / msPerDay)
  }

  const getMembershipStatus = (member: Member) => {
    const today = new Date()
    const endDate = new Date(member.membershipEndDate)
    const daysRemaining = daysBetweenDates(today, endDate)

    if (!member.isActive) {
      return { status: t.inactive, variant: "secondary" as const, daysRemaining: 0 }
    } else if (daysRemaining < 0) {
      return { status: t.expired, variant: "destructive" as const, daysRemaining }
    } else if (daysRemaining <= 30) {
      return { status: t.expiring_soon, variant: "outline" as const, daysRemaining }
    } else {
      return { status: t.active, variant: "default" as const, daysRemaining }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{t.member_management}</CardTitle>
            <CardDescription>{t.manage_all_members}</CardDescription>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t.search_members}
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
              {searchTerm ? t.no_members_found_search : t.no_members_found}
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
                          {t.joined_on}{" "}
{language === "am"
  ? toEthiopianDate(new Date(member.joinDate))
  : new Date(member.joinDate).toLocaleDateString("en-US")}

                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <Badge variant={membershipStatus.variant}>{membershipStatus.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {membershipStatus.daysRemaining > 0
                          ? `${membershipStatus.daysRemaining} ${t.days_left}`
                          : membershipStatus.daysRemaining < 0
                            ? `${t.expired} ${Math.abs(membershipStatus.daysRemaining)} ${t.days_ago}`
                            : t.expires_today}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{member.membershipType} {t.membership}</p>
                      {member.lastEditedBy && (
  <p className="text-xs text-muted-foreground italic mt-1">
    {t.last_edited_by || "Last edited by"}: {member.lastEditedBy}
  </p>
)}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/members/${member.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberToDelete(member)}
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

      {editingMember && (
        <MemberEditModal
          member={editingMember}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onMemberUpdated={handleMemberUpdated}
        />
      )}

      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">{t.delete_member}</h3>
            <p className="text-sm mb-4">
              {t.delete_member_confirm} <strong>{memberToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMemberToDelete(null)}>
                {t.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMember(memberToDelete.id)
                  setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id))
                  toast({
                    title: t.member_deleted,
                    description: `${memberToDelete.name} ${t.member_deleted_success}`,
                  })
                  setMemberToDelete(null)
                }}
              >
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
