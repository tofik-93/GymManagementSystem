import { ref, get, set, update, remove, push } from "firebase/database"
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage"
import {rtdb ,storage} from "@/lib/firebaseConfig" 
import type { Member, MembershipAlert, Admin, DashboardStats, GymSettings, MembershipType } from "./types"
import { getGymId } from "@/lib/gymContext"
import imageCompression from "browser-image-compression";
// ------------------------
// Default Admin Initialization

// ------------------------


export const initializeDefaultAdmin = async () => {

  const snapshot = await get(ref(rtdb, "admins"))
  if (!snapshot.exists()) {
    const defaultAdmin: Admin = {
      id: "admin-1",
      username: "admin",
      email: "admin@gym.com",
      role: "manager",
      createdAt: new Date().toISOString(),
      password : "1234",
      gymId : "1",
      language: "en",
      isActive: true,
    }
    await set(ref(rtdb, `admins/${defaultAdmin.id}`), defaultAdmin)
  }
}

// ------------------------
// Member Operations
// ------------------------
export const getMembers = async (): Promise<Member[]> => {
  
  const gymId = getGymId()
  const snapshot = await get(ref(rtdb, `gyms/${gymId}/members`))
  return snapshot.exists() ? Object.values(snapshot.val()) as Member[] : []
}
export const saveSettings = async (settings: GymSettings): Promise<void> => {
  try {
    const gymId = getGymId()
    await set(ref(rtdb, `gyms/${gymId}/settings`), {
      ...settings,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Error saving settings:", err)
    throw err
  }
}

// 🔹 Get settings from Firebase
export const getSettings = async (): Promise<GymSettings | null> => {
  try {
    const gymId = getGymId()
    const snapshot = await get(ref(rtdb, `gyms/${gymId}/settings`))
    if (!snapshot.exists()) return null
    const settings = snapshot.val() as GymSettings
    
    // Migrate old settings to new format if needed
    if (settings && !settings.membershipTypes) {
      const defaultMembershipTypes: MembershipType[] = [
        {
          id: "monthly",
          name: "Monthly",
          duration: 30,
          price: (settings as any).monthlyPrice || 50,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "quarterly", 
          name: "Quarterly",
          duration: 90,
          price: (settings as any).quarterlyPrice || 40,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "yearly",
          name: "Yearly", 
          duration: 365,
          price: (settings as any).yearlyPrice || 35,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
      
      const migratedSettings: GymSettings = {
        ...settings,
        membershipTypes: defaultMembershipTypes
      }
      
      // Save migrated settings
      await saveSettings(migratedSettings)
      return migratedSettings
    }
    
    return settings
  } catch (err) {
    console.error("Error fetching settings:", err)
    return null
  }
}
export const saveMember = async (member: Member, photoFile?: File): Promise<void> => {
  let photoUrl = member.photo;
  const gymId = getGymId();

  if (photoFile) {
    // 🔹 Compress the image
    const options = {
      maxSizeMB: 0.1, // target <100 KB
      maxWidthOrHeight: 800, // optional: limit resolution
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(photoFile, options);
    console.log(compressedFile.size)
    // 🔹 Upload compressed image
    const photoRef = storageRef(storage, `gyms/${gymId}/members/${member.id}.jpg`);
    await uploadBytes(photoRef, compressedFile);
    photoUrl = await getDownloadURL(photoRef);
  }

  // 🔹 Save member data
  const memberRef = ref(rtdb, `/gyms/${gymId}/members/${member.id}`);
  await set(memberRef, {
    ...member,
    photo: photoUrl,
    updatedAt: new Date().toISOString(),
  });

  await updateSingleMembershipAlert(member);
};
const updateSingleMembershipAlert = async (member: Member): Promise<void> => {
  const gymId = getGymId();
  const alertsRef = ref(rtdb, `gyms/${gymId}/alerts/${member.id}`);
  const today = new Date();
  const endDate = new Date(member.membershipEndDate);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  let alert: MembershipAlert | null = null;

  if (daysRemaining <= 30 && daysRemaining >= 0) {
    alert = {
      id: `alert-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      alertType: "expiring",
      daysRemaining,
      membershipEndDate: member.membershipEndDate,
      createdAt: new Date().toISOString(),
    };
  } else if (daysRemaining < 0) {
    alert = {
      id: `alert-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      alertType: "expired",
      daysRemaining,
      membershipEndDate: member.membershipEndDate,
      createdAt: new Date().toISOString(),
    };
  }

  if (alert) {
    await set(alertsRef, alert);
  } else {
    await remove(alertsRef);
  }
};

export const updateMember = async (memberId: string, updates: Partial<Member>, photoFile?: File): Promise<void> => {
  const gymId = getGymId();
  const memberRef = ref(rtdb, `/gyms/${gymId}/members/${memberId}`);

  let updatedPhotoUrl = updates.photo;

  // 🔹 Handle optional photo upload (with compression)
  if (photoFile) {
    const options = {
      maxSizeMB: 0.1, // <100KB target
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(photoFile, options);
    const photoRef = storageRef(storage, `gyms/${gymId}/members/${memberId}.jpg`);
    await uploadBytes(photoRef, compressedFile);
    updatedPhotoUrl = await getDownloadURL(photoRef);
  }

  const updateData = {
    ...updates,
    ...(updatedPhotoUrl && { photo: updatedPhotoUrl }),
    updatedAt: new Date().toISOString(),
  };

  await update(memberRef, updateData);
};

export const deleteMember = async (memberId: string): Promise<void> => {
  const gymId = getGymId()
  await remove(ref(rtdb, `gyms/${gymId}/members/${memberId}`))
  await updateMembershipAlerts()
}

// ------------------------
// Alerts Operations
// ------------------------
export const getAlerts = async (): Promise<MembershipAlert[]> => {
  const gymId = getGymId()
  const snapshot = await get(ref(rtdb, `gyms/${gymId}/alerts`))
  const data = snapshot.val()

  if (!data || typeof data !== "object") return []

  return Object.values(data) as MembershipAlert[]
}

export const updateMembershipAlerts = async (): Promise<void> => {
  const gymId = getGymId()
  const members = await getMembers()
  const alerts: Record<string, MembershipAlert> = {}
  const today = new Date()

  members.forEach((member) => {
    if (!member.isActive) return
    const endDate = new Date(member.membershipEndDate)
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysRemaining <= 30 && daysRemaining >= 0) {
      alerts[member.id] = {
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expiring",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      }
    } else if (daysRemaining < 0) {
      alerts[member.id] = {
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expired",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      }
    }
  })
  await set(ref(rtdb, `gyms/${gymId}/alerts`), alerts)
}
export const updateAdminPassword = async (adminId: string, newPassword: string) => {
  const adminRef = ref(rtdb, `admins/${adminId}`);
  await update(adminRef, { password: newPassword, updatedAt: new Date().toISOString() });
};


// ------------------------
// Membership Type Operations
// ------------------------
export const getMembershipTypes = async (): Promise<MembershipType[]> => {
  const settings = await getSettings()
  return settings?.membershipTypes || []
}

export const addMembershipType = async (membershipType: Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const gymId = getGymId()
  const settings = await getSettings()
  if (!settings) throw new Error("Settings not found")
  
  const newMembershipType: MembershipType = {
    ...membershipType,
    id: `type-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedSettings: GymSettings = {
    ...settings,
    membershipTypes: [...settings.membershipTypes, newMembershipType]
  }
  
  await saveSettings(updatedSettings)
}

export const updateMembershipType = async (id: string, updates: Partial<Omit<MembershipType, 'id' | 'createdAt'>>): Promise<void> => {
  const gymId = getGymId()
  const settings = await getSettings()
  if (!settings) throw new Error("Settings not found")
  
  const updatedMembershipTypes = settings.membershipTypes.map(type => 
    type.id === id 
      ? { ...type, ...updates, updatedAt: new Date().toISOString() }
      : type
  )
  
  const updatedSettings: GymSettings = {
    ...settings,
    membershipTypes: updatedMembershipTypes
  }
  
  await saveSettings(updatedSettings)
}

export const deleteMembershipType = async (id: string): Promise<void> => {
  const gymId = getGymId()
  const settings = await getSettings()
  if (!settings) throw new Error("Settings not found")
  
  // Check if any members are using this membership type
  const members = await getMembers()
  const membersUsingType = members.filter(member => member.membershipType === id)
  
  if (membersUsingType.length > 0) {
    throw new Error(`Cannot delete membership type. ${membersUsingType.length} members are currently using this type.`)
  }
  
  const updatedMembershipTypes = settings.membershipTypes.filter(type => type.id !== id)
  
  const updatedSettings: GymSettings = {
    ...settings,
    membershipTypes: updatedMembershipTypes
  }
  
  await saveSettings(updatedSettings)
}

export const getMembershipTypeById = async (id: string): Promise<MembershipType | null> => {
  const membershipTypes = await getMembershipTypes()
  return membershipTypes.find(type => type.id === id) || null
}

// ------------------------
// Admin Operations
// ------------------------
export const getAdmins = async (): Promise<Admin[]> => {
  const snapshot = await get(ref(rtdb, `admins`))
  return snapshot.exists() ? Object.values(snapshot.val()) as Admin[] : []
}

export const addStaff = async (staff: Omit<Admin, 'id' | 'createdAt'>): Promise<void> => {
  const newStaff: Admin = {
    ...staff,
    id: `staff-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  
  await set(ref(rtdb, `admins/${newStaff.id}`), newStaff)
}

export const updateStaff = async (staffId: string, updates: Partial<Omit<Admin, 'id' | 'createdAt'>>): Promise<void> => {
  const staffRef = ref(rtdb, `admins/${staffId}`)
  await update(staffRef, { ...updates, updatedAt: new Date().toISOString() })
}

export const deleteStaff = async (staffId: string): Promise<void> => {
  await remove(ref(rtdb, `admins/${staffId}`))
}

export const getStaffByGym = async (gymId: string): Promise<Admin[]> => {
  const snapshot = await get(ref(rtdb, `admins`))
  if (!snapshot.exists()) return []
  
  const admins = Object.values(snapshot.val()) as Admin[]
  console.log(admins)
  console.log(gymId)
  return admins.filter(
    (admin) => String(admin.gymId) === String(gymId) && admin.role === "staff"
  )
  
}

export const getManagersByGym = async (gymId: string): Promise<Admin[]> => {
  const snapshot = await get(ref(rtdb, `admins`))
  if (!snapshot.exists()) return []
  
  const admins = Object.values(snapshot.val()) as Admin[]
  return admins.filter(
    (admin) => String(admin.gymId) === String(gymId) && admin.role === "manager"
  )
  
}

// ------------------------
// Dashboard Stats
// ------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const members: Member[] = await getMembers()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalMembers = members.length
  const activeMembers = members.filter((m) => m.isActive).length
  const expiredMembers = members.filter((m) => new Date(m.membershipEndDate) < now).length
  const expiringMembers = members.filter((m) => {
    const end = new Date(m.membershipEndDate)
    const daysRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysRemaining > 0 && daysRemaining <= 30
  }).length

  // ✅ Sum membershipTypeAmount for active members only
  const monthlyRevenue = members
    .filter((m) => m.isActive)
    .reduce((total, m) => total + (m.membershipTypeAmount || 0), 0)

  const newMembersThisMonth = members.filter(
    (m) => new Date(m.joinDate) >= startOfMonth
  ).length

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
    expiringMembers,
    monthlyRevenue,
    newMembersThisMonth,
  }
}