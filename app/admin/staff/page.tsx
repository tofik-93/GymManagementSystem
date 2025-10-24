"use client"

import { StaffManagement } from "@/components/staff-management"
import { RoleGuard } from "@/components/role-guard"

export default function StaffPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-2">Manage gym staff members and their access permissions</p>
        </div>
        
        <StaffManagement />
      </div>
    </RoleGuard>
  )
}
