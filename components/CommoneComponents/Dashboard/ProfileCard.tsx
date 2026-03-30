"use client"

import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Edit, Mail, Shield, User } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import EditProfileModal from "./EditProfileModal"

export default function ProfileCard() {
  const { user, setUser, refreshUser } = useUserContext()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (!user) return null

  // Generate initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-600",
    MODERATOR: "bg-amber-500/10 text-amber-600",
    MODERATORS: "bg-amber-500/10 text-amber-600",
    USER: "bg-blue-500/10 text-blue-600",
  }

  const roleBgColor = roleColors[user.role || "USER"] || roleColors.USER

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-md">
      {/* Header gradient background */}
      <div className="h-24 bg-linear-to-r from-primary/20 to-primary/10" />

      {/* Profile content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4 flex items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-linear-to-br from-primary/30 to-primary/10">
            {user.photo ? (
              <Image
                src={user.photo}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Role Badge */}
        {user.role && (
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${roleBgColor}`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* User Details Grid */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-4 w-4 shrink-0 text-primary/60" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="text-sm break-all text-foreground">{user.email}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-3">
            <User className="mt-1 h-4 w-4 shrink-0 text-primary/60" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                User ID
              </p>
              <p className="font-mono text-sm break-all text-foreground">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-4 border-t border-border/50 pt-4">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full"
            variant="default"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => {
          setUser({
            ...user,
            ...updated,
          })
          void refreshUser()
        }}
      />
    </div>
  )
}
