import { MemberRegistrationForm } from "@/components/member-registration-form"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Add New Member</h1>
        <p className="text-muted-foreground mt-2">Register a new gym member with complete profile information</p>
      </div>

      {/* Registration Form */}
      <div className="flex justify-center">
        <MemberRegistrationForm />
      </div>
    </div>
  )
}
