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
export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
const handleEdit = (member: Member) => {
  console.log(member)
  setEditingMember(member)
  setIsEditModalOpen(true)
}  
const handleMemberUpdated = (updated: Member) => {
  setMember(updated); // just replace the single member
}

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
  
      try {
        const memberId = params.id as string;
        const members = await getMembers();
        const foundMember = members.find((m) => m.id === memberId);
  
        if (foundMember) {
          setMember(foundMember);
        } else {
          toast({
            title: "Member Not Found",
            description: "The requested member could not be found.",
            variant: "destructive",
          });
          router.push("/admin/members");
        }
      } catch (err) {
        console.error("Error fetching member:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMember();
  }, [params.id, router, toast]);
  

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

    const updatedMember: Member = {
      ...member,
      membershipStartDate: today.toISOString().split("T")[0],
      membershipEndDate: newEndDate.toISOString().split("T")[0],
      isActive: true,
      updatedAt: new Date().toISOString(),
    }

    saveMember(updatedMember)
    setMember(updatedMember)
    toast({
      title: "Membership Renewed",
      description: `${member.name}'s membership has been renewed successfully.`,
    })
  }

  const getMembershipProgress = () => {
    if (!member) return { progressPercentage: 0, daysRemaining: 0, status: "Unknown" }

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
        <h2 className="text-2xl font-bold text-muted-foreground">Member Not Found</h2>
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Member Profile</h1>
            <p className="text-muted-foreground">Detailed member information and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleEdit(member)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={renewMembership}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Renew Membership
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
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{member.name}</CardTitle>
            <CardDescription>Member ID: {member.id}</CardDescription>
            <Badge
              variant={
                progress.status === "Active"
                  ? "default"
                  : progress.status === "Expired"
                    ? "destructive"
                    : progress.status === "Critical"
                      ? "destructive"
                      : progress.status === "Expiring Soon"
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
              <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Membership Details</CardTitle>
            <CardDescription>Current membership status and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Membership Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Membership Progress</span>
                <span>{Math.round(progress.progressPercentage)}%</span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started: {new Date(member.membershipStartDate).toLocaleDateString()}</span>
                <span>Ends: {new Date(member.membershipEndDate).toLocaleDateString()}</span>
              </div>
            </div>

            <Separator />

            {/* Membership Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Membership Type
                  </h4>
                  <p className="text-lg font-medium capitalize">{member.membershipType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Status</h4>
                  <p className="text-lg font-medium">{member.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Days Remaining
                  </h4>
                  <p className="text-lg font-medium">
                    {progress.daysRemaining > 0
                      ? `${progress.daysRemaining} days`
                      : progress.daysRemaining < 0
                        ? `Expired ${Math.abs(progress.daysRemaining)} days ago`
                        : "Expires today"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Start Date</h4>
                  <p className="text-lg font-medium">{new Date(member.membershipStartDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">End Date</h4>
                  <p className="text-lg font-medium">{new Date(member.membershipEndDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Last Updated</h4>
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
                Emergency Contact
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
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {member.dateOfBirth && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Date of Birth</h4>
                  <p className="text-lg font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Member Since</h4>
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
