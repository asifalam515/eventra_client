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

function getUserStatusBadgeClass(status?: string) {
  if (status === "BLOCKED") {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100"
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
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
        <h2 className="text-2xl font-semibold text-foreground">
          Admin User Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Fetch users, inspect single user by ID, and block suspicious accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {users.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <p className="text-xs text-muted-foreground">Active Users</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur sm:col-span-2 xl:col-span-1">
          <p className="text-xs text-muted-foreground">Blocked Users</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">
            {blockedCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Search user by ID"
              className="bg-background"
            />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              onClick={handleFindById}
              disabled={isFetching || !queryId.trim()}
              className="flex-1 sm:flex-none"
            >
              {isFetching ? "Searching..." : "Find User"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshUsers}
              disabled={isFetching}
              className="flex-1 sm:flex-none"
            >
              Refresh Users
            </Button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Selected User
            </h3>
            <span
              className={`rounded-full px-2 py-1 text-xs ${getUserStatusBadgeClass(selectedUser.status)}`}
            >
              {selectedUser.status}
            </span>
          </div>

          <div className="grid gap-1 text-sm text-muted-foreground">
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

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="size-4" /> All Users
          </h3>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {users.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border/70 bg-background/70 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.email || "N/A"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] ${getUserStatusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Role: {item.role}</span>
                <span className="truncate">ID: {item.id}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.role !== "MODERATOR" && item.role !== "MODERATORS" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMakeModerator(item.id)}
                    disabled={isMutating}
                  >
                    <ShieldCheck className="size-4" /> Moderator
                  </Button>
                )}

                {item.status !== "BLOCKED" ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBlockUser(item.id)}
                    disabled={isMutating}
                  >
                    <ShieldBan className="size-4" /> Block
                  </Button>
                ) : (
                  <span className="self-center text-xs text-muted-foreground">
                    Already blocked
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
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
                <tr
                  key={item.id}
                  className="border-t border-border/60 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getUserStatusBadgeClass(item.status)}`}
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
                        <span className="self-center text-xs text-muted-foreground">
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
