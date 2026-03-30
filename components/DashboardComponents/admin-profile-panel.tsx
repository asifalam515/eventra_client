"use client"

import { updateProfileAction } from "@/actions/user"
import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Mail, Save, UserRound } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

export default function AdminProfilePanel() {
  const { user, refreshUser } = useUserContext()
  const [isSaving, startSavingTransition] = useTransition()
  const [name, setName] = useState(() => user?.name || "")
  const [email, setEmail] = useState(() => user?.email || "")
  const [photo, setPhoto] = useState(() => user?.photo || "")
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const hasChanges = useMemo(() => {
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    const normalizedPhoto = photo.trim()

    return (
      normalizedName !== (user?.name || "") ||
      normalizedEmail !== (user?.email || "") ||
      normalizedPhoto !== (user?.photo || "")
    )
  }, [email, name, photo, user?.email, user?.name, user?.photo])

  const handleSave = () => {
    if (!user?.id) {
      setToast({
        type: "error",
        message: "Unable to find current admin profile.",
      })
      return
    }

    startSavingTransition(async () => {
      const result = await updateProfileAction(user.id, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        photo: photo.trim() || undefined,
      })

      if (!result.success) {
        setToast({
          type: "error",
          message:
            result.error || result.message || "Failed to update profile.",
        })
        return
      }

      await refreshUser()
      setToast({
        type: "success",
        message: result.message || "Profile updated.",
      })
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Admin Profile Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Keep your admin identity accurate and up to date.
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
              <UserRound className="size-3.5" /> Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="bg-background"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
              <Mail className="size-3.5" /> Email Address
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="bg-background"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
              <Camera className="size-3.5" /> Profile Photo URL
            </label>
            <Input
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
              className="bg-background"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Changes are applied to your account and reflected in dashboard
            context.
          </p>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-2"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div
            className={`max-w-xs rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-900/40 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/80 dark:bg-red-900/40 dark:text-red-100"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
