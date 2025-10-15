import { createContext, useContext } from "react"
import { getGymIdCookie } from "./auth"

let currentGymId: string | null = null

export const setGymId = (gymId: string) => {
  currentGymId = gymId
}

export const getGymId = (): string => {
  if (!currentGymId) {
    // ✅ Try to restore from cookie if in memory is null
    const cookieGymId = getGymIdCookie()
    if (!cookieGymId) {
      throw new Error("Gym ID not set. Call setGymId() after login or selection.")
    }
    currentGymId = cookieGymId
  }
  return currentGymId
}
