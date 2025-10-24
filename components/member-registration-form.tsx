"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { saveMember, getSettings, getMembershipTypes } from "@/lib/storage"
import type { Member, GymSettings, MembershipType } from "@/lib/types"
import { Camera, User } from "lucide-react"
import { translations } from "@/lib/language"
import { getAdminLanguage, getCurrentAdmin } from "@/lib/auth"


export function MemberRegistrationForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])
  const [language, setLanguage] = useState<"en" | "am">("en")
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: "",
    membershipType: "" as string,
    photo: "",
  })

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    getSettings().then(setSettings)
    getMembershipTypes().then(setMembershipTypes)
    const admin = getCurrentAdmin()
  setCurrentAdmin(admin)
  }, [])

  const t = translations[language]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setFormData((prev) => ({ ...prev, photo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateMembershipEndDate = (startDate: string, membershipTypeId: string): string => {
    const start = new Date(startDate)
    const membershipType = membershipTypes.find(type => type.id === membershipTypeId)
    
    if (!membershipType) {
      // Fallback to 30 days if type not found
      const end = new Date(start)
      end.setDate(end.getDate() + 30)
      return end.toISOString().split("T")[0]
    }

    const end = new Date(start)
    end.setDate(end.getDate() + membershipType.duration)
    return end.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.membershipType) {
        toast({
          title: t.validation_error,
          description: t.fill_required_fields,
          variant: "destructive",
        })
        return
      }

// ✅ Determine membershipTypeAmount based on selected type
let membershipTypeAmount = 0
const selectedMembershipType = membershipTypes.find(type => type.id === formData.membershipType)
if (selectedMembershipType) {
  membershipTypeAmount = selectedMembershipType.price
}

      const today = new Date().toISOString().split("T")[0]
      const membershipEndDate = calculateMembershipEndDate(today, formData.membershipType)
      
      const newMember: Member = {
        id: `member-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        photo: formData.photo,
        joinDate: today,
        membershipType: formData.membershipType,
        membershipStartDate: today,
        membershipEndDate,
        membershipTypeAmount,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentAdmin?.username || "Unknown Admin",
        lastEditedBy: currentAdmin?.username || "Unknown Admin",
        gymId: currentAdmin?.gymId || "unknown"
      }

      await saveMember(newMember)

      toast({
        title: t.registration_success,
        description: `${formData.name} ${t.registered_successfully}`,
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        emergencyContact: "",
        emergencyPhone: "",
        membershipType: "",
        photo: "",
      })
      setPhotoPreview(null)
    } catch {
      toast({
        title: t.registration_failed,
        description: t.registration_failed_desc,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">{t.member_registration}</CardTitle>
        <CardDescription>{t.member_registration_desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {photoPreview ? (
                <img src={photoPreview} alt="Member photo" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </label>
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <p className="text-sm text-muted-foreground">{t.upload_photo_optional}</p>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name} *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder={t.enter_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email} *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder={t.enter_email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone} *</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder={t.enter_phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t.date_of_birth}</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">{t.address}</Label>
            <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} rows={3} />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">{t.emergency_contact}</Label>
              <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleInputChange("emergencyContact", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">{t.emergency_phone}</Label>
              <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => handleInputChange("emergencyPhone", e.target.value)} />
            </div>
          </div>

          {/* Membership Type */}
          <div className="space-y-2">
            <Label htmlFor="membershipType">{t.membershipType} *</Label>
            <Select value={formData.membershipType} onValueChange={(value) => handleInputChange("membershipType", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.select_membership_type} />
              </SelectTrigger>
              <SelectContent>
                {membershipTypes.filter(type => type.isActive).map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} - ETB {type.price} ({type.duration} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t.registering : t.register_member}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
