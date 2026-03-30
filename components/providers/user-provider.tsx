"use client"

import { getCurrentUserAction } from "@/actions/user"
import { SessionUser } from "@/lib/session-user"
import { useUserStore } from "@/lib/user-store"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type UserContextValue = {
  user: SessionUser | null
  isRefreshing: boolean
  setUser: (user: SessionUser | null) => void
  refreshUser: () => Promise<SessionUser | null>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: SessionUser | null
}) {
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser, setUser])

  const refreshUser = useCallback(async () => {
    setIsRefreshing(true)

    try {
      const nextUser = await getCurrentUserAction()
      setUser(nextUser)
      return nextUser
    } finally {
      setIsRefreshing(false)
    }
  }, [setUser])

  const value = useMemo(
    () => ({
      user,
      isRefreshing,
      setUser,
      refreshUser,
    }),
    [user, isRefreshing, setUser, refreshUser]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUserContext must be used within UserProvider")
  }

  return context
}
