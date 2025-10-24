"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateMember, getMembershipTypes, getSettings } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import type { Member, MembershipType, GymSettings } from "@/lib/types"
import { translations } from "@/lib/language"
import { getAdminLanguage, setAdminLanguage, getCurrentAdmin } from "@/lib/auth"  // ⚡ added getCurrentAdmin
import { Globe } from "lucide-react"

interface MemberEditModalProps {
  member: Member | null
  open: boolean
  onClose: () => void
  onMemberUpdated: (updated: Member) => void
}

export function MemberEditModal({ member, open, onClose, onMemberUpdated }: MemberEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Member | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [language, setLanguage] = useState<"en" | "am">("en")
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])

  const [currentAdmin, setCurrentAdmin] = useState<any>(null) // ⚡ holds logged-in admin
  const t = translations[language]

  useEffect(() => {
    getSettings().then(setSettings)
    getMembershipTypes().then(setMembershipTypes)

    // ⚡ Load logged-in admin info
    const admin = getCurrentAdmin()
    if (admin) setCurrentAdmin(admin)
  }, [])

  useEffect(() => {
    setFormData(member)
  }, [member])

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    setMounted(true)
  }, [])

  if (!mounted || !formData) return null

  const handleChange = (field: keyof Member, value: string | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleMembershipChange = (newTypeId: string) => {
    if (!formData) return
    const startDate = new Date(formData.membershipStartDate || new Date())
    const membershipType = membershipTypes.find(type => type.id === newTypeId)
    
    if (!membershipType) return
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + membershipType.duration)
  
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            membershipType: newTypeId,
            membershipStartDate: startDate.toISOString(),
            membershipEndDate: endDate.toISOString(),
            membershipTypeAmount: membershipType.price,
          }
        : prev
    )
  }

  const handleSave = async () => {
    if (!formData) return
    try {
      // ⚡ Attach lastEditedBy info
      const updatedMember: Member = {
        ...formData,
        updatedAt: new Date().toISOString(),
        lastEditedBy: currentAdmin?.username || currentAdmin?.email || "Unknown Admin",
      }

      await updateMember(formData.id, updatedMember)
      setShowSuccess(true)
      onMemberUpdated(updatedMember)
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        title: t.updateFailed,
        description: t.somethingWrong,
        variant: "destructive",
      })
    }
  }

  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "am" : "en"
    setLanguage(newLang)
    setAdminLanguage(newLang)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>{t.editMemberDetails}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleToggleLanguage}>
            <Globe className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t.name}</Label>
            <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div>
            <Label>{t.email}</Label>
            <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div>
            <Label>{t.phone}</Label>
            <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div>
            <Label>{t.address}</Label>
            <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div>
            <Label>{t.dateOfBirth}</Label>
            <Input
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.emergencyContact}</Label>
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.emergencyPhone}</Label>
            <Input
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
            />
          </div>
          <div>
            <Label>{t.membershipType}</Label>
            <Select
              value={formData.membershipType}
              onValueChange={handleMembershipChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectType} />
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
          <div className="flex items-center gap-4">
            <Label>{t.status}</Label>
            <Button
              variant={formData.isActive ? "default" : "outline"}
              onClick={() => handleChange("isActive", !formData.isActive)}
            >
              {formData.isActive ? t.active : t.inactive}
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave}>{t.saveChanges}</Button>
        </DialogFooter>
      </DialogContent>

      {showSuccess && (
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader />
            <p className="flex items-center text-gray-600 mb-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Success"
                className="mr-2 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="12" fill="#16a34a" />
                <path
                  d="M7.5 12.5l2.5 2.5 6-7"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {formData.name} {t.profileUpdated}
            </p>
            <DialogFooter>
              <Button onClick={() => setShowSuccess(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
