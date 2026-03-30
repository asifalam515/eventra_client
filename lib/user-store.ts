"use client"

import { SessionUser } from "@/lib/session-user"
import { create } from "zustand"

type UserStoreState = {
  user: SessionUser | null
  setUser: (user: SessionUser | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
