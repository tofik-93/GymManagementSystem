import { MembersTable } from "@/components/members-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Download } from "lucide-react"

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Member Management</h1>
          <p className="text-muted-foreground mt-2">Manage all gym members, their profiles, and membership status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
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
