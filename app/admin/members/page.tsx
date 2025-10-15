"use client"

import { useState } from "react"
import { MembersTable } from "@/components/members-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebaseConfig"
import { getGymId } from "@/lib/gymContext"
export default function MembersPage() {
  const [loading, setLoading] = useState(false)

  const exportMembers = async () => {
    try {
      setLoading(true)
      const gymId = getGymId()
      const snapshot = await get(ref(rtdb, `gyms/${gymId}/members`))
  
      if (!snapshot.exists()) {
        console.warn("No members found.")
        setLoading(false)
        return
      }
  
      const data = snapshot.val()
      const membersArray = Object.keys(data).map((id) => {
        const { photo, ...rest } = data[id] // remove the photo or huge fields
        return {
          id,
          ...rest,
          membershipEndDate: data[id].membershipEndDate
            ? new Date(data[id].membershipEndDate).toLocaleDateString()
            : "",
          joinDate: data[id].joinDate
            ? new Date(data[id].joinDate).toLocaleDateString()
            : "",
        }
      })
      
  
      const worksheet = XLSX.utils.json_to_sheet(membersArray)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Members")
  
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, `gym_members_${gymId}.xlsx`)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all gym members, their profiles, and membership status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMembers} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? "Exporting..." : "Export Data"}
          </Button>
          <Button asChild>
            <Link href="/admin/register">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Members Table */}
      <MembersTable />
    </div>
  )
}
