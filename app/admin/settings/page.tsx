"use client"

import { useState, useEffect } from "react"
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

interface SettingsState {
  gymName: string
  adminEmail: string
  alertDays: number
  monthlyPrice: number
  quarterlyPrice: number
  yearlyPrice: number
  emailNotifications: boolean
  smsNotifications: boolean
  autoRenewal: boolean
  memberLimit: number
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
    monthlyPrice: 50,
    quarterlyPrice: 40,
    yearlyPrice: 35,
    emailNotifications: true,
    smsNotifications: false,
    autoRenewal: true,
    memberLimit: 500,
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
        title: t.settings_saved,
        description: t.settings_saved_desc,
        variant: "default",
      })
      setShowSuccessModal(true)
    } catch {
      toast({
        title: t.error,
        description: t.settings_save_error,
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
        setPasswordError(t.current_password_incorrect)
        return
      }
      setShowNewPasswordFields(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.new_password_mismatch)
      return
    }

    try {
      await updateAdminPassword(currentAdmin.id, newPassword)
      setPasswordSuccess(t.password_changed)
      setShowPasswordModal(false)
      setShowNewPasswordFields(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setCurrentAdmin((prev) => (prev ? { ...prev, password: newPassword } : prev))
    } catch {
      setPasswordError(t.password_update_failed)
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
    <div className="space-y-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">{t.settings_updated}</h3>
            <p className="text-sm mb-4">{t.settings_updated_desc}</p>
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
            <CardDescription>{t.notification_settings_desc}</CardDescription>
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
                <p className="text-sm text-muted-foreground">{t.email_notifications_desc}</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.sms_notifications}</Label>
                <p className="text-sm text-muted-foreground">{t.sms_notifications_desc}</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> {t.pricing_settings}
            </CardTitle>
            <CardDescription>{t.pricing_settings_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">{t.monthly_membership}</Label>
              <Input
                id="monthlyPrice"
                type="number"
                value={settings.monthlyPrice}
                onChange={(e) => handleInputChange("monthlyPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarterlyPrice">{t.quarterly_membership}</Label>
              <Input
                id="quarterlyPrice"
                type="number"
                value={settings.quarterlyPrice}
                onChange={(e) => handleInputChange("quarterlyPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyPrice">{t.yearly_membership}</Label>
              <Input
                id="yearlyPrice"
                type="number"
                value={settings.yearlyPrice}
                onChange={(e) => handleInputChange("yearlyPrice", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> {t.system_settings}
            </CardTitle>
            <CardDescription>{t.system_settings_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.auto_renewal}</Label>
                <p className="text-sm text-muted-foreground">{t.auto_renewal_desc}</p>
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
                <Badge variant="default">{t.online}</Badge>
                <Badge variant="secondary">{t.database_connected}</Badge>
                <Badge variant="outline">{t.alerts_active}</Badge>
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
  )
}
