export interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  emergencyContact: string
  emergencyPhone: string
  photo?: string
  joinDate: string
  membershipType: string // Changed to string to support dynamic types
  membershipStartDate: string
  membershipEndDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  membershipTypeAmount : number
  createdBy?: string
  lastEditedBy?: string
  gymId?: string
}
export interface MembershipType {
  id: string
  name: string
  duration: number // Duration in days
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GymSettings {
  gymName: string
  adminEmail: string
  alertDays: number
  membershipTypes: MembershipType[] // Dynamic membership types
  emailNotifications: boolean
  smsNotifications: boolean
  autoRenewal: boolean
  memberLimit: number
}
export interface MembershipAlert {
  id: string
  memberId: string
  memberName: string
  alertType: "expiring" | "expired"
  daysRemaining: number
  membershipEndDate: string
  createdAt: string
 
}

export interface Admin {
  id: string
  username: string
  email: string
  role: "manager" | "staff"
  createdAt: string
  password: string
  gymId: string
  language: "en" | "am"
  isActive: boolean
  createdBy?: string // ID of the manager who created this staff member
}


export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  expiringMembers: number
  monthlyRevenue: number
  newMembersThisMonth: number
}
