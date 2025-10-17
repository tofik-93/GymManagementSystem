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
  membershipType: "monthly" | "quarterly" | "yearly"
  membershipStartDate: string
  membershipEndDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  membershipTypeAmount : number
}
export interface GymSettings {
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
  role: "admin" | "manager"
  createdAt: string
  password: string
  gymId: string
  language: "en" | "am"  
}


export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  expiringMembers: number
  monthlyRevenue: number
  newMembersThisMonth: number
}
