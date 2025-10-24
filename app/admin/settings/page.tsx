"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { saveSettings, getSettings, getAdmins, updateAdminPassword } from "@/lib/storage"
import { Settings, Bell, DollarSign, Shield, Save, Key } from "lucide-react"
import { getAdminLanguage } from "@/lib/auth"
import { Admin } from "@/lib/types"
import { translations } from "@/lib/language"
import { MembershipTypesManager } from "@/components/membership-types-manager"

interface SettingsState {
  gymName: string
  adminEmail: string
  alertDays: number
  emailNotifications: boolean
  smsNotifications: boolean
  autoRenewal: boolean
  memberLimit: number
  membershipTypes: any[] // This will be managed by the MembershipTypesManager component
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [language, setLanguage] = useState<"en" | "am">(getAdminLanguage())
  const t = translations[language]

  const [settings, setSettings] = useState<SettingsState>({
    gymName: "",
    adminEmail: "",
    alertDays: 30,
    emailNotifications: true,
    smsNotifications: false,
    autoRenewal: true,
    memberLimit: 500,
    membershipTypes: [],
  })

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    const fetchSettingsAndAdmin = async () => {
      const storedSettings = await getSettings()
      if (storedSettings) setSettings(storedSettings)

      const admins = await getAdmins()
      if (admins.length > 0) setCurrentAdmin(admins[0])
    }
    fetchSettingsAndAdmin()
  }, [])

  const handleInputChange = (field: keyof SettingsState, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await saveSettings(settings)
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
        variant: "default",
      })
      setShowSuccessModal(true)
    } catch {
      toast({
        title: t.error,
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    if (!currentAdmin) return
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!showNewPasswordFields) {
      if (currentPassword !== currentAdmin.password) {
        setPasswordError("Current password is incorrect")
        return
      }
      setShowNewPasswordFields(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    try {
      await updateAdminPassword(currentAdmin.id, newPassword)
      setPasswordSuccess("Password changed successfully")
      setShowPasswordModal(false)
      setShowNewPasswordFields(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setCurrentAdmin((prev) => (prev ? { ...prev, password: newPassword } : prev))
    } catch {
      setPasswordError("Failed to update password")
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      const storedSettings = await getSettings()
      if (storedSettings) setSettings(storedSettings)
    }
    fetchSettings()
  }, [])

  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="space-y-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">{t.settings_updated}</h3>
            <p className="text-sm mb-4">Your settings have been updated successfully</p>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              {t.close}
            </Button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">{t.change_password}</h3>
            {passwordError && <p className="text-sm text-red-600 mb-2">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600 mb-2">{passwordSuccess}</p>}

            {!showNewPasswordFields ? (
              <>
                <Label>{t.current_password}</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </>
            ) : (
              <>
                <Label>{t.new_password}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Label>{t.confirm_password}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </>
            )}

            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false)
                  setShowNewPasswordFields(false)
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setPasswordError(null)
                  setPasswordSuccess(null)
                }}
              >
                {t.cancel}
              </Button>
              <Button onClick={handlePasswordChange}>{t.save}</Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.settings}</h1>
        <p className="text-muted-foreground mt-2">{t.settings_desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> {t.general_settings}
            </CardTitle>
            <CardDescription>{t.general_settings_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gymName">{t.gym_name}</Label>
              <Input
                id="gymName"
                value={settings.gymName}
                onChange={(e) => handleInputChange("gymName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">{t.admin_email}</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleInputChange("adminEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberLimit">{t.member_limit}</Label>
              <Input
                id="memberLimit"
                type="number"
                value={settings.memberLimit}
                onChange={(e) => handleInputChange("memberLimit", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> {t.notification_settings}
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alertDays">{t.alert_days_before_expiry}</Label>
              <Input
                id="alertDays"
                type="number"
                value={settings.alertDays}
                onChange={(e) => handleInputChange("alertDays", Number(e.target.value))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.email_notifications}</Label>
                <p className="text-sm text-muted-foreground">Send email notifications for membership alerts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.sms_notifications}</Label>
                <p className="text-sm text-muted-foreground">Send SMS notifications for membership alerts</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Membership Types Management */}
        <div className="lg:col-span-2">
          <MembershipTypesManager />
        </div>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> {t.system_settings}
            </CardTitle>
            <CardDescription>System configuration and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.auto_renewal}</Label>
                <p className="text-sm text-muted-foreground">Automatically renew memberships when they expire</p>
              </div>
              <Switch
                checked={settings.autoRenewal}
                onCheckedChange={(checked) => handleInputChange("autoRenewal", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t.system_status}</Label>
              <div className="flex gap-2">
                <Badge variant="default">Online</Badge>
                <Badge variant="secondary">Database Connected</Badge>
                <Badge variant="outline">Alerts Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save & Change Password Buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} className="w-full sm:w-auto flex items-center">
          <Save className="w-4 h-4 mr-2" />
          {t.save_settings}
        </Button>
        <Button onClick={() => setShowPasswordModal(true)} className="w-full sm:w-auto flex items-center">
          <Key className="w-4 h-4 mr-2" />
          {t.change_password}
        </Button>
      </div>
    </div>
    </RoleGuard>
  )
}
