"use client"

import {
  AdminUser,
  banUserAction,
  getAllUsersAction,
  getUserByIdAction,
  makeUserModeratorAction,
} from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldBan, ShieldCheck, Users } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

export default function AdminUsersPanel({
  initialUsers,
  initialMessage,
  initialMessageType,
}: {
  initialUsers: AdminUser[]
  initialMessage?: string
  initialMessageType?: "success" | "error"
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [queryId, setQueryId] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [toast, setToast] = useState<ToastState | null>(() => {
    if (!initialMessage || !initialMessageType) return null

    return {
      type: initialMessageType,
      message: initialMessage,
    }
  })
  const [isFetching, startFetchTransition] = useTransition()
  const [isMutating, startMutatingTransition] = useTransition()

  const showToast = (type: ToastState["type"], message: string) => {
    if (!message) return

    setToast({ type, message })
  }

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const blockedCount = useMemo(
    () => users.filter((item) => item.status === "BLOCKED").length,
    [users]
  )

  const activeCount = useMemo(
    () => users.filter((item) => item.status !== "BLOCKED").length,
    [users]
  )

  const handleRefreshUsers = () => {
    startFetchTransition(async () => {
      const result = await getAllUsersAction()
      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setUsers(result.data)
      showToast("success", "Users refreshed.")
    })
  }

  const handleFindById = () => {
    startFetchTransition(async () => {
      const result = await getUserByIdAction(queryId)
      if (!result.success || !result.data) {
        showToast("error", result.message || "User not found.")
        setSelectedUser(null)
        return
      }

      setSelectedUser(result.data)
      showToast("success", "User found.")
    })
  }

  const handleBlockUser = (userId: string) => {
    startMutatingTransition(async () => {
      const result = await banUserAction(userId)
      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId ? { ...item, status: "BLOCKED" } : item
        )
      )

      setSelectedUser((prev) =>
        prev && prev.id === userId ? { ...prev, status: "BLOCKED" } : prev
      )

      showToast("success", result.message)
    })
  }

  const handleMakeModerator = (userId: string) => {
    startMutatingTransition(async () => {
      const result = await makeUserModeratorAction(userId)

      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId ? { ...item, role: "MODERATOR" } : item
        )
      )

      setSelectedUser((prev) =>
        prev && prev.id === userId ? { ...prev, role: "MODERATOR" } : prev
      )

      showToast("success", result.message)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Admin User Management
        </h2>
        <p className="text-sm text-slate-600">
          Fetch users, inspect single user by ID, and block suspicious accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Total Users</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {users.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Active Users</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Blocked Users</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">
            {blockedCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search className="size-4 text-slate-500" />
            <Input
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Search user by ID"
              className="bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFindById}
              disabled={isFetching || !queryId.trim()}
            >
              {isFetching ? "Searching..." : "Find User"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshUsers}
              disabled={isFetching}
            >
              Refresh Users
            </Button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Selected User
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {selectedUser.status}
            </span>
          </div>

          <div className="grid gap-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Name:</span> {selectedUser.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {selectedUser.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {selectedUser.role}
            </p>
            <p>
              <span className="font-medium">ID:</span> {selectedUser.id}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedUser.role !== "MODERATOR" &&
              selectedUser.role !== "MODERATORS" && (
                <Button
                  variant="secondary"
                  onClick={() => handleMakeModerator(selectedUser.id)}
                  disabled={isMutating}
                >
                  <ShieldCheck className="size-4" />
                  {isMutating ? "Updating..." : "Make Moderator"}
                </Button>
              )}

            {selectedUser.status !== "BLOCKED" && (
              <Button
                variant="destructive"
                onClick={() => handleBlockUser(selectedUser.id)}
                disabled={isMutating}
              >
                <ShieldBan className="size-4" />
                {isMutating ? "Blocking..." : "Block User"}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users className="size-4" /> All Users
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.status === "BLOCKED"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.role !== "MODERATOR" &&
                        item.role !== "MODERATORS" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMakeModerator(item.id)}
                            disabled={isMutating}
                          >
                            <ShieldCheck className="size-4" /> Moderator
                          </Button>
                        )}

                      {item.status === "BLOCKED" ? (
                        <span className="self-center text-xs text-slate-500">
                          Already blocked
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBlockUser(item.id)}
                          disabled={isMutating}
                        >
                          <ShieldBan className="size-4" /> Block
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div
            className={`max-w-xs rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
