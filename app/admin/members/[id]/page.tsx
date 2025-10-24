"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getMembers, saveMember } from "@/lib/storage"
import type { Member } from "@/lib/types"
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MemberEditModal } from "@/components/edit-member"
import { translations } from "@/lib/language"
import { getAdminLanguage , getCurrentAdmin } from "@/lib/auth"
import { getSettings } from "@/lib/storage"
import type { GymSettings } from "@/lib/types"
import { de } from "date-fns/locale"

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<GymSettings | null>(null)

  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [language, setLanguage] = useState<"en" | "am">("en")
const [mounted, setMounted] = useState(false)
const t = translations[language]


// avoid server/client mismatch


 
  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    setMounted(true)
  
    const fetchMember = async () => {
      setLoading(true)
      try {
        const memberId = params.id as string
        const members = await getMembers()
        const foundMember = members.find((m) => m.id === memberId)
  
        if (foundMember) {
          setMember(foundMember)
        } else {
          toast({
            title: t.member_not_found,
            description: t.member_not_found_desc,
            variant: "destructive",
          })
          router.push("/admin/members")
        }
      } catch (err) {
        console.error("Error fetching member:", err)
      } finally {
        setLoading(false)
      }
    }
  
    // ✅ Load both member and settings
    fetchMember()
    getSettings().then(setSettings)
  }, [params.id, router, toast, t])
  if (!mounted) return null 
  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsEditModalOpen(true)
  }  

  const handleMemberUpdated = (updated: Member) => {
    setMember(updated)
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

const renewMembership = () => {
  if (!member) return

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

  // ✅ Determine membership amount based on type and settings
  let membershipTypeAmount = member.membershipTypeAmount || 0

  if (settings?.membershipTypes?.length) {
    const matchedType = settings.membershipTypes.find(
      (type) => type.name.toLowerCase() === member.membershipType.toLowerCase()
    )

    if (matchedType) {
      membershipTypeAmount = matchedType.price
    } else {
      console.warn(`⚠️ No matching membership type found for "${member.membershipType}"`)
    }
  }

  // ✅ Get the currently logged-in admin
  const currentAdmin = getCurrentAdmin()
  const lastEditedBy = currentAdmin?.username || "Unknown Admin"

  const updatedMember: Member = {
    ...member,
    membershipStartDate: today.toISOString().split("T")[0],
    membershipEndDate: newEndDate.toISOString().split("T")[0],
    membershipTypeAmount,
    isActive: true,
    updatedAt: new Date().toISOString(),
    lastEditedBy, // ✅ Track who renewed the membership
  }

  saveMember(updatedMember)
  setMember(updatedMember)
  toast({
    title: t.membership_renewed,
    description: `${member.name} ${t.membership_renewed_success}`,
  })
}



  const getMembershipProgress = () => {
    if (!member) return { progressPercentage: 0, daysRemaining: 0, status: t.unknown }

    const startDate = new Date(member.membershipStartDate)
    const endDate = new Date(member.membershipEndDate)
    const today = new Date()

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)

    let status = "Active"
    if (!member.isActive) {
      status = "Inactive"
    } else if (daysRemaining < 0) {
      status = "Expired"
    } else if (daysRemaining <= 7) {
      status = "Critical"
    } else if (daysRemaining <= 30) {
      status = "Expiring Soon"
    }

    return { progressPercentage, daysRemaining, status }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-muted-foreground">{t.member_not_found}</h2>
      </div>
    )
  }

  const progress = getMembershipProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.member_profile}</h1>
            <p className="text-muted-foreground">{t.member_profile_desc}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleEdit(member)}>
            <Edit className="w-4 h-4 mr-2" />
            {t.edit_profile}
          </Button>
          <Button onClick={renewMembership}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.renew_membership}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={member.photo || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="text-2xl">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{member.name}</CardTitle>
            <CardDescription>{t.member_id}: {member.id}</CardDescription>
            <Badge
              variant={
                progress.status === t.active
                  ? "default"
                  : progress.status === t.expired
                    ? "destructive"
                    : progress.status === t.critical
                      ? "destructive"
                      : progress.status === t.expiring_soon
                        ? "outline"
                        : "secondary"
              }
              className="mt-2"
            >
              {progress.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
            {member.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{member.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{t.joined_on}{" "}
{language === "am"
  ? toEthiopianDate(new Date(member.joinDate))
  : new Date(member.joinDate).toLocaleDateString("en-US")}
</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{t.created_by}</span>
              <span>{member.createdBy}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" /> 
              <span>{t.last_edited_by}</span>
              <span>{member.lastEditedBy}</span>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.membership_details}</CardTitle>
            <CardDescription>{t.membership_details_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Membership Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.membership_progress}</span>
                <span>{Math.round(progress.progressPercentage)}%</span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.started}: {t.joined_on}{" "}
{language === "am"
  ? toEthiopianDate(new Date(member.membershipStartDate))
  : new Date(member.membershipStartDate).toLocaleDateString("en-US")}
</span>
                <span>{t.ends}: {t.joined_on}{" "}
{language === "am"
  ? toEthiopianDate(new Date(member.membershipEndDate))
  : new Date(member.membershipEndDate).toLocaleDateString("en-US")}
</span>
              </div>
            </div>

            <Separator />

            {/* Membership Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t.membership_type}
                  </h4>
                  <p className="text-lg font-medium capitalize">{member.membershipType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.status}</h4>
                  <p className="text-lg font-medium">{member.isActive ? t.active : t.inactive}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t.days_remaining}
                  </h4>
                  <p className="text-lg font-medium">
                    {progress.daysRemaining > 0
                      ? `${progress.daysRemaining} ${t.days}`
                      : progress.daysRemaining < 0
                        ? `${t.expired} ${Math.abs(progress.daysRemaining)} ${t.days_ago}`
                        : t.expires_today}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.start_date}</h4>
                  <p className="text-lg font-medium">{new Date(member.membershipStartDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.end_date}</h4>
                  <p className="text-lg font-medium">{new Date(member.membershipEndDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.last_updated}</h4>
                  <p className="text-lg font-medium">{new Date(member.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(member.emergencyContact || member.emergencyPhone) && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t.emergency_contact}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.emergencyContact && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{member.emergencyContact}</span>
                </div>
              )}
              {member.emergencyPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{member.emergencyPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.personal_info}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {member.dateOfBirth && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.date_of_birth}</h4>
                  <p className="text-lg font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.member_since}</h4>
                <p className="text-lg font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MemberEditModal
        member={editingMember}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onMemberUpdated={handleMemberUpdated}
      />
    </div>
  )
}
