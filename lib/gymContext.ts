// /lib/gymContext.ts
let currentGymId: string | null = null

export const setGymId = (id: string) => {
  currentGymId = id
}

export const getGymId = (): string => {
  if (!currentGymId) {
    throw new Error("Gym ID not set. Call setGymId() after login or selection.")
  }
  return currentGymId
}
