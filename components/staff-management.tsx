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
import { getStaffByGym, addStaff, updateStaff, deleteStaff } from "@/lib/storage"
import type { Admin } from "@/lib/types"
import { Plus, Edit, Trash2, Save, X, UserPlus } from "lucide-react"
import { translations } from "@/lib/language"
import { getAdminLanguage, getCurrentAdmin } from "@/lib/auth"
import { getGymId } from "@/lib/gymContext"

export function StaffManagement() {
  const { toast } = useToast()
  const [staff, setStaff] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Admin | null>(null)
  const [language, setLanguage] = useState<"en" | "am">("en")
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)

  const t = translations[language]

  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    password: "",
    language: "en" as "en" | "am",
    isActive: true,
  })

  const [editStaff, setEditStaff] = useState({
    username: "",
    email: "",
    password: "",
    language: "en" as "en" | "am",
    isActive: true,
  })

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    const admin = getCurrentAdmin()
    setCurrentAdmin(admin)
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setIsLoading(true)
      const gymId = getGymId()
      const allAdmins = await getStaffByGym("1")
      console.log(allAdmins)
      // ✅ Only keep users whose role is "staff"
      const staffList = allAdmins.filter((admin: Admin) => admin.role === "staff")
      setStaff(staffList)
    } catch (error) {
      toast({
        title: t.error,
        description: t.failed_to_load_staff,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleAddStaff = async () => {
    try {
      if (!newStaff.username || !newStaff.email || !newStaff.password) {
        toast({
          title: t.validation_error,
          description: t.fill_required_fields,
          variant: "destructive",
        })
        return
      }

      if (!currentAdmin) {
        toast({
          title: t.error,
          description: t.current_admin_not_found,
          variant: "destructive",
        })
        return
      }

      await addStaff({
        ...newStaff,
        role: "staff",
        gymId: currentAdmin.gymId,
        createdBy: currentAdmin.id,
      })
      
      await loadStaff()
      setNewStaff({ username: "", email: "", password: "", language: "en", isActive: true })
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: t.staff_added_success,
      })
    } catch (error) {
      toast({
        title: t.error,
        description: t.failed_to_add_staff,
        variant: "destructive",
      })
    }
  }

  const handleEditStaff = async () => {
    if (!editingStaff) return

    try {
      if (!editStaff.username || !editStaff.email) {
        toast({
          title: t.validation_error,
          description: t.fill_required_fields,
          variant: "destructive",
        })
        return
      }

      const updates: any = {
        username: editStaff.username,
        email: editStaff.email,
        language: editStaff.language,
        isActive: editStaff.isActive,
      }

      // Only update password if provided
      if (editStaff.password) {
        updates.password = editStaff.password
      }

      await updateStaff(editingStaff.id, updates)
      await loadStaff()
      setEditingStaff(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: t.staff_updated_success,
      })
    } catch (error) {
      toast({
        title: t.error,
        description: t.failed_to_update_staff,
        variant: "destructive",
      })
    }
  }

  const handleDeleteStaff = async (staffId: string, username: string) => {
    if (!confirm(t.delete_staff_confirm)) {
      return
    }

    try {
      await deleteStaff(staffId)
      await loadStaff()
      toast({
        title: "Success",
        description: t.staff_deleted_success,
      })
    } catch (error) {
      toast({
        title: t.error,
        description: t.failed_to_delete_staff,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (staffMember: Admin) => {
    setEditingStaff(staffMember)
    setEditStaff({
      username: staffMember.username,
      email: staffMember.email,
      password: "",
      language: staffMember.language,
      isActive: staffMember.isActive,
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading staff members...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {t.staff_management}
            </CardTitle>
            <CardDescription>{t.staff_management_desc}</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t.add_staff}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.add_staff_member}</DialogTitle>
                <DialogDescription>{t.add_staff_desc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">{t.username}</Label>
                  <Input
                    id="username"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    placeholder={t.enter_username}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder={t.enter_email}
                  />
                </div>
                <div>
                  <Label htmlFor="password">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder={t.enter_password}
                  />
                </div>
                <div>
                  <Label htmlFor="language">{t.language}</Label>
                  <select
                    id="language"
                    value={newStaff.language}
                    onChange={(e) => setNewStaff({ ...newStaff, language: e.target.value as "en" | "am" })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="en">{t.english}</option>
                    <option value="am">{t.amharic}</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newStaff.isActive}
                    onCheckedChange={(checked) => setNewStaff({ ...newStaff, isActive: checked })}
                  />
                  <Label htmlFor="isActive">{t.active}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleAddStaff}>
                  <Save className="w-4 h-4 mr-2" />
                  {t.add_staff}
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
              <TableHead>{t.username}</TableHead>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.language}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.created}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell className="font-medium">{staffMember.username}</TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>{staffMember.language === "en" ? t.english : t.amharic}</TableCell>
                <TableCell>
                  <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                    {staffMember.isActive ? t.active : t.inactive}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(staffMember.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(staffMember)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStaff(staffMember.id, staffMember.username)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {staff.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No staff members found. Add your first staff member to get started.
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.edit_staff_member}</DialogTitle>
              <DialogDescription>{t.edit_staff_desc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">{t.username}</Label>
                <Input
                  id="edit-username"
                  value={editStaff.username}
                  onChange={(e) => setEditStaff({ ...editStaff, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t.email}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editStaff.email}
                  onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">{t.password} ({t.new_password_placeholder})</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editStaff.password}
                  onChange={(e) => setEditStaff({ ...editStaff, password: e.target.value })}
                  placeholder={t.new_password_placeholder}
                />
              </div>
              <div>
                <Label htmlFor="edit-language">{t.language}</Label>
                <select
                  id="edit-language"
                  value={editStaff.language}
                  onChange={(e) => setEditStaff({ ...editStaff, language: e.target.value as "en" | "am" })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">{t.english}</option>
                  <option value="am">{t.amharic}</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editStaff.isActive}
                  onCheckedChange={(checked) => setEditStaff({ ...editStaff, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">{t.active}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleEditStaff}>
                <Save className="w-4 h-4 mr-2" />
                {t.save_changes}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
