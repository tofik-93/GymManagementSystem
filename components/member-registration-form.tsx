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
import { saveMember, getSettings } from "@/lib/storage"
import type { Member, GymSettings } from "@/lib/types"
import { Camera, User, Phone, Mail, MapPin, Calendar, AlertTriangle } from "lucide-react"

export function MemberRegistrationForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [settings, setSettings] = useState<GymSettings | null>(null)

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
    const fetchSettings = async () => {
      const gymSettings = await getSettings()
      setSettings(gymSettings)
    }
    fetchSettings()
  }, [])

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

  const calculateMembershipEndDate = (startDate: string, type: string): string => {
    const start = new Date(startDate)
    const end = new Date(start)
  
    switch (type) {
      case "monthly":
        end.setMonth(end.getMonth() + 1)
        break
      case "quarterly":
        end.setMonth(end.getMonth() + 3)
        break
      case "yearly":
        end.setFullYear(end.getFullYear() + 1)
        break
    }
  
    // Subtract 1 day so the membership ends the day before the same date next month/year
    end.setDate(end.getDate() - 1)
  
    return end.toISOString().split("T")[0]
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.membershipType) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
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
        membershipType: formData.membershipType as "monthly" | "quarterly" | "yearly",
        membershipStartDate: today,
        membershipEndDate,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveMember(newMember)

      toast({
        title: "Registration Successful!",
        description: `${formData.name} has been registered successfully.`,
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
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error registering the member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Member Registration</CardTitle>
        <CardDescription>Register a new gym member with complete details and membership information</CardDescription>
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
            <p className="text-sm text-muted-foreground">Upload member photo (optional)</p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name *
              </Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address *
              </Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Enter email address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number *
              </Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="Enter phone number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth
              </Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address
            </Label>
            <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} rows={3} />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">
                Emergency Contact Name
              </Label>
              <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleInputChange("emergencyContact", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">
                Emergency Contact Phone
              </Label>
              <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => handleInputChange("emergencyPhone", e.target.value)} />
            </div>
          </div>

          {/* Membership Type */}
          <div className="space-y-2">
  <Label htmlFor="membershipType">Membership Type *</Label>
  <Select value={formData.membershipType} onValueChange={(value) => handleInputChange("membershipType", value)}>
    <SelectTrigger>
      <SelectValue placeholder="Select membership type" />
    </SelectTrigger>
    <SelectContent>
      {settings && (
        <>
          <SelectItem value="monthly">Monthly - ETB {settings.monthlyPrice}/month</SelectItem>
          <SelectItem value="quarterly">Quarterly - ETB {settings.quarterlyPrice}/month</SelectItem>
          <SelectItem value="yearly">Yearly - ETB {settings.yearlyPrice}/month</SelectItem>
        </>
      )}
    </SelectContent>
  </Select>
</div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register Member"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
