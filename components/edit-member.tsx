"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateMember } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import type { Member } from "@/lib/types"

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

  useEffect(() => {
    setFormData(member)
  }, [member])

  if (!formData) return null

  const handleChange = (field: keyof Member, value: string | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleMembershipChange = (newType: "monthly" | "quarterly" | "yearly") => {
    const startDate = new Date(formData.membershipStartDate || new Date())
    const endDate = new Date(startDate)

    switch (newType) {
      case "monthly":
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case "quarterly":
        endDate.setMonth(startDate.getMonth() + 3)
        break
      case "yearly":
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
    }

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            membershipType: newType,
            membershipStartDate: startDate.toISOString(),
            membershipEndDate: endDate.toISOString(),
          }
        : prev
    )
  }

  const handleSave = async () => {
    if (!formData) return
    try {
        await updateMember(formData.id, formData)

        // trigger success modal instead of toast
        setShowSuccess(true)
        
        // update local state and close edit modal
        onMemberUpdated(formData)
        onClose()
        
    } catch (error) {
      console.error(error)
      toast({
        title: "Update Failed",
        description: "Something went wrong while saving changes.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Member Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label>Emergency Contact</Label>
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
            />
          </div>
          <div>
            <Label>Emergency Phone</Label>
            <Input
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
            />
          </div>
          <div>
            <Label>Membership Type</Label>
            <Select
              value={formData.membershipType}
              onValueChange={(v) =>
                handleMembershipChange(v as "monthly" | "quarterly" | "yearly")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label>Status</Label>
            <Button
              variant={formData.isActive ? "default" : "outline"}
              onClick={() => handleChange("isActive", !formData.isActive)}
            >
              {formData.isActive ? "Active" : "Inactive"}
            </Button>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
      {showSuccess && (
  <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
    <DialogContent className="max-w-sm text-center">
      <DialogHeader>
    


      </DialogHeader>
      <p className="text-gray-600 mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Success">
  <title>Success</title>
  <circle cx="12" cy="12" r="12" fill="#16a34a" />
  <path d="M7.5 12.5l2.5 2.5 6-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>{formData.name}'s profile has been updated successfully.
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
