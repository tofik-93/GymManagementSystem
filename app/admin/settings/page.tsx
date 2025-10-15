"use client"

import { useState , useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { saveSettings, getSettings  , getAdmins , updateAdminPassword } from "@/lib/storage"
import { Settings, Bell, DollarSign, Shield, Save, Key } from "lucide-react"

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null);
const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    gymName: "FitLife Gym",
    adminEmail: "admin@gym.com",
    alertDays: 30,
    monthlyPrice: 50,
    quarterlyPrice: 40,
    yearlyPrice: 35,
    emailNotifications: true,
    smsNotifications: false,
    autoRenewal: true,
    memberLimit: 500,
  })
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const fetchSettingsAndAdmin = async () => {
      const storedSettings = await getSettings();
      if (storedSettings) setSettings(storedSettings);
  
      const admins = await getAdmins();
      if (admins.length > 0) setCurrentAdmin(admins[0]); // Take first admin
    };
    fetchSettingsAndAdmin();
  }, []);
 
  const handleInputChange = (field: keyof SettingsState, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await saveSettings(settings)
      toast({
        title: "Settings Saved",
        description: "Your gym settings have been updated successfully.",
        variant:"default",
      })
      setShowSuccessModal(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings. Try again.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    if (!currentAdmin) return;
  
    setPasswordError(null); // reset error
    setPasswordSuccess(null); // reset success
  
    if (!showNewPasswordFields) {
      // Step 1: validate current password
      if (currentPassword !== currentAdmin.password) {
        setPasswordError("Current password is incorrect");
        return;
      }
      setShowNewPasswordFields(true);
      return;
    }
  
    // Step 2: validate new password confirmation
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }
  
    try {
      await updateAdminPassword(currentAdmin.id, newPassword);
      setPasswordSuccess("Password changed successfully!");
      
      setShowPasswordModal(false);
      setShowNewPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
  
      setCurrentAdmin((prev) => prev ? { ...prev, password: newPassword } : prev);
    } catch (err) {
      setPasswordError("Failed to update password. Try again.");
    }
  };
  // Optionally, load settings on mount:
  useEffect(() => {
    const fetchSettings = async () => {
      const storedSettings = await getSettings()
      if (storedSettings) setSettings(storedSettings)
    }
    fetchSettings()
  }, [])

  return (
    <div className="space-y-6">
      {/* Settings saved success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">Settings Updated</h3>
            <p className="text-sm mb-4">Your gym settings have been successfully saved.</p>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Change password modal */}
      
      {showPasswordModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
      <h3 className="text-lg font-bold mb-4">Change Password</h3>

      {passwordError && <p className="text-sm text-red-600 mb-2">{passwordError}</p>}
      {passwordSuccess && <p className="text-sm text-green-600 mb-2">{passwordSuccess}</p>}

      {!showNewPasswordFields && (
        <>
          <Label>Current Password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </>
      )}
      {showNewPasswordFields && (
        <>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Label>Confirm Password</Label>
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
            setShowPasswordModal(false);
            setShowNewPasswordFields(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
        >
          Cancel
        </Button>
        <Button onClick={handlePasswordChange}>
          Save
        </Button>
      </div>
    </div>
  </div>
)}

      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your gym management system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> General Settings
            </CardTitle>
            <CardDescription>Basic gym information and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gymName">Gym Name</Label>
              <Input
                id="gymName"
                value={settings.gymName}
                onChange={(e) => handleInputChange("gymName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleInputChange("adminEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberLimit">Member Limit</Label>
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
              <Bell className="w-5 h-5" /> Notification Settings
            </CardTitle>
            <CardDescription>Configure alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alertDays">Alert Days Before Expiry</Label>
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
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send alerts via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send alerts via SMS</p>
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
              <DollarSign className="w-5 h-5" /> Pricing Settings
            </CardTitle>
            <CardDescription>Configure membership pricing tiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Monthly Membership ($)</Label>
              <Input
                id="monthlyPrice"
                type="number"
                value={settings.monthlyPrice}
                onChange={(e) => handleInputChange("monthlyPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarterlyPrice">Quarterly Membership ($/month)</Label>
              <Input
                id="quarterlyPrice"
                type="number"
                value={settings.quarterlyPrice}
                onChange={(e) => handleInputChange("quarterlyPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyPrice">Yearly Membership ($/month)</Label>
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
              <Shield className="w-5 h-5" /> System Settings
            </CardTitle>
            <CardDescription>Advanced system configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Renewal</Label>
                <p className="text-sm text-muted-foreground">Automatically renew expired memberships</p>
              </div>
              <Switch
                checked={settings.autoRenewal}
                onCheckedChange={(checked) => handleInputChange("autoRenewal", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>System Status</Label>
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
          Save Settings
        </Button>
        <Button onClick={() => setShowPasswordModal(true)} className="w-full sm:w-auto flex items-center">
          <Key className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </div>
    </div>
  )
}
