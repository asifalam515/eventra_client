"use client"

import { updateProfileAction } from "@/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionUser } from "@/lib/session-user"
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useActionState, useEffect, useRef, useState } from "react"

interface EditProfileModalProps {
  user: SessionUser
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updated: { name: string; email: string; photo?: string }) => void
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [toastProgress, setToastProgress] = useState(100)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [photo, setPhoto] = useState(user.photo || "")
  const [isModified, setIsModified] = useState(false)

  const [, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const nameValue = formData.get("name") as string
      const emailValue = formData.get("email") as string
      const photoValue = formData.get("photo") as string

      const result = await updateProfileAction(user.id, {
        name: nameValue !== user.name ? nameValue : undefined,
        email: emailValue !== user.email ? emailValue : undefined,
        photo: photoValue !== (user.photo || "") ? photoValue : undefined,
      })

      if (result.success) {
        const payload =
          (result.data as Record<string, unknown> | undefined) ?? undefined
        const userPayload =
          (payload?.user as Record<string, unknown> | undefined) ??
          (payload?.profile as Record<string, unknown> | undefined) ??
          payload

        const nextName =
          String(userPayload?.name ?? userPayload?.fullName ?? nameValue) ||
          nameValue
        const nextEmail =
          String(userPayload?.email ?? userPayload?.userEmail ?? emailValue) ||
          emailValue
        const nextPhoto =
          String(userPayload?.photo ?? userPayload?.avatar ?? photoValue) ||
          photoValue

        setToastMessage("Profile updated successfully!")
        setToastType("success")
        setShowToast(true)
        setToastProgress(100)

        setName(nextName)
        setEmail(nextEmail)
        setPhoto(nextPhoto)
        setIsModified(false)

        onSuccess?.({
          name: nextName,
          email: nextEmail,
          photo: nextPhoto || undefined,
        })
        onClose()
      } else {
        setToastMessage(result.error || "Failed to update profile")
        setToastType("error")
        setShowToast(true)
        setToastProgress(100)
      }

      return result
    },
    null
  )

  useEffect(() => {
    if (showToast) {
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false)
      }, 3500)

      progressIntervalRef.current = setInterval(() => {
        setToastProgress((prev) => {
          if (prev <= 0) {
            clearInterval(progressIntervalRef.current!)
            return 0
          }
          return prev - 1.4
        })
      }, 50)

      return () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
        if (progressIntervalRef.current)
          clearInterval(progressIntervalRef.current)
      }
    }
  }, [showToast])

  useEffect(() => {
    if (!isOpen) return

    const syncTimer = setTimeout(() => {
      setName(user.name)
      setEmail(user.email)
      setPhoto(user.photo || "")
      setIsModified(false)
    }, 0)

    return () => clearTimeout(syncTimer)
  }, [isOpen, user])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setIsModified(true)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setIsModified(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoto(e.target.value)
    setIsModified(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4 px-6 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              disabled={isPending}
              className="rounded-lg"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              disabled={isPending}
              className="rounded-lg"
            />
          </div>

          {/* Photo URL Field */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              name="photo"
              type="url"
              value={photo}
              onChange={handlePhotoChange}
              placeholder="https://example.com/photo.jpg"
              disabled={isPending}
              className="rounded-lg"
            />
            {photo && (
              <div className="mt-2 flex justify-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={photo}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isModified}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg ${
            toastType === "success"
              ? "border-green-500/20 bg-green-500/10"
              : "border-red-500/20 bg-red-500/10"
          }`}
        >
          <div className="flex-1">
            {toastType === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={
                toastType === "success"
                  ? "text-sm text-green-800"
                  : "text-sm text-red-800"
              }
            >
              {toastMessage}
            </p>
          </div>
          {/* Progress Bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 w-full overflow-hidden rounded-b-lg bg-linear-to-r from-transparent to-transparent">
            <div
              className={`h-full transition-all duration-75 ${
                toastType === "success" ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </div>
      )}
    </>
  )
}
