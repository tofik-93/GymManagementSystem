"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getMembershipTypes, addMembershipType, updateMembershipType, deleteMembershipType } from "@/lib/storage"
import type { MembershipType } from "@/lib/types"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { translations } from "@/lib/language"
import { getAdminLanguage } from "@/lib/auth"

export function MembershipTypesManager() {
  const { toast } = useToast()
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<MembershipType | null>(null)
  const [language, setLanguage] = useState<"en" | "am">("en")

  const t = translations[language]

  const [newType, setNewType] = useState({
    name: "",
    duration: 30,
    price: 0,
    isActive: true,
  })

  const [editType, setEditType] = useState({
    name: "",
    duration: 30,
    price: 0,
    isActive: true,
  })

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    loadMembershipTypes()
  }, [])

  const loadMembershipTypes = async () => {
    try {
      setIsLoading(true)
      const types = await getMembershipTypes()
      setMembershipTypes(types)
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to load membership types",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddType = async () => {
    try {
      if (!newType.name || newType.duration <= 0 || newType.price < 0) {
        toast({
          title: t.validation_error,
          description: "Please fill in all fields with valid values",
          variant: "destructive",
        })
        return
      }

      await addMembershipType(newType)
      await loadMembershipTypes()
      setNewType({ name: "", duration: 30, price: 0, isActive: true })
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Membership type added successfully",
      })
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to add membership type",
        variant: "destructive",
      })
    }
  }

  const handleEditType = async () => {
    if (!editingType) return

    try {
      if (!editType.name || editType.duration <= 0 || editType.price < 0) {
        toast({
          title: t.validation_error,
          description: "Please fill in all fields with valid values",
          variant: "destructive",
        })
        return
      }

      await updateMembershipType(editingType.id, editType)
      await loadMembershipTypes()
      setEditingType(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Membership type updated successfully",
      })
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to update membership type",
        variant: "destructive",
      })
    }
  }

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteMembershipType(id)
      await loadMembershipTypes()
      toast({
        title: "Success",
        description: "Membership type deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || "Failed to delete membership type",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (type: MembershipType) => {
    setEditingType(type)
    setEditType({
      name: type.name,
      duration: type.duration,
      price: type.price,
      isActive: type.isActive,
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading membership types...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Membership Types</CardTitle>
            <CardDescription>Manage gym membership types, durations, and pricing</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Membership Type</DialogTitle>
                <DialogDescription>Create a new membership type with custom duration and pricing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    placeholder="e.g., Weekly, 6-Month, Lifetime"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newType.duration}
                    onChange={(e) => setNewType({ ...newType, duration: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (ETB)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newType.price}
                    onChange={(e) => setNewType({ ...newType, price: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newType.isActive}
                    onCheckedChange={(checked) => setNewType({ ...newType, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddType}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Type
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membershipTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>{type.duration} days</TableCell>
                <TableCell>ETB {type.price}</TableCell>
                <TableCell>
                  <Badge variant={type.isActive ? "default" : "secondary"}>
                    {type.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(type)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteType(type.id, type.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Membership Type</DialogTitle>
              <DialogDescription>Update membership type details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editType.name}
                  onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editType.duration}
                  onChange={(e) => setEditType({ ...editType, duration: Number(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (ETB)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editType.price}
                  onChange={(e) => setEditType({ ...editType, price: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editType.isActive}
                  onCheckedChange={(checked) => setEditType({ ...editType, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditType}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
