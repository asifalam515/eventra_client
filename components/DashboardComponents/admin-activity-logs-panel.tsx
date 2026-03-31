"use client"

import { AdminActivityLog, getAdminActivityLogsAction } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { History, RefreshCw, Search } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

function formatDate(value?: string) {
  if (!value) return "N/A"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed)
}

function actionBadge(action: string) {
  if (action.includes("DELETE")) {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100"
  }
  if (action.includes("UPDATE")) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
  }
  if (action.includes("BAN")) {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100"
  }

  return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100"
}

export default function AdminActivityLogsPanel({
  initialLogs,
  initialTotal,
  initialPage,
  initialLimit,
  initialMessage,
  initialMessageType,
}: {
  initialLogs: AdminActivityLog[]
  initialTotal: number
  initialPage: number
  initialLimit: number
  initialMessage?: string
  initialMessageType?: "success" | "error"
}) {
  const [logs, setLogs] = useState(initialLogs)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState<ToastState | null>(() => {
    if (!initialMessage || !initialMessageType) return null

    return {
      type: initialMessageType,
      message: initialMessage,
    }
  })

  const [isLoading, startLoadingTransition] = useTransition()

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const totalPages = useMemo(() => {
    const value = Math.ceil(total / Math.max(1, limit))
    return value > 0 ? value : 1
  }, [total, limit])

  const filteredLogs = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()

    if (!normalized) return logs

    return logs.filter((item) => {
      const action = item.action.toLowerCase()
      const target = (item.targetId || "").toLowerCase()
      const details = (item.details || "").toLowerCase()
      const adminName = (item.admin?.name || "").toLowerCase()
      const adminEmail = (item.admin?.email || "").toLowerCase()

      return (
        action.includes(normalized) ||
        target.includes(normalized) ||
        details.includes(normalized) ||
        adminName.includes(normalized) ||
        adminEmail.includes(normalized)
      )
    })
  }, [logs, searchTerm])

  const loadLogs = (nextPage: number, nextLimit: number) => {
    startLoadingTransition(async () => {
      const result = await getAdminActivityLogsAction({
        page: nextPage,
        limit: nextLimit,
      })

      if (!result.success) {
        setToast({ type: "error", message: result.message })
        return
      }

      setLogs(result.data.logs)
      setTotal(result.data.total)
      setPage(result.data.page)
      setLimit(result.data.limit)
      setToast({ type: "success", message: result.message })
    })
  }

  const currentRangeStart = logs.length ? (page - 1) * limit + 1 : 0
  const currentRangeEnd = logs.length ? currentRangeStart + logs.length - 1 : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Activity Logs
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor admin actions and moderation history across the platform.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadLogs(page, limit)}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search action, target, admin"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="size-3.5" />
            Showing {currentRangeStart}-{currentRangeEnd} of {total}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredLogs.map((log) => (
          <article
            key={log.id}
            className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${actionBadge(log.action)}`}
              >
                {log.action}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(log.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Admin: {log.admin?.name || "Unknown"} ({log.admin?.email || "N/A"}
              )
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Target: {log.targetId || "N/A"}
            </p>
            {log.details && (
              <p className="mt-2 text-sm text-foreground">{log.details}</p>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border/70 bg-card/80 shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Target ID</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-border/60 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${actionBadge(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {log.admin?.name || "Unknown"}
                  </p>
                  <p className="text-xs">{log.admin?.email || "N/A"}</p>
                </td>
                <td className="max-w-55 truncate px-4 py-3 text-muted-foreground">
                  {log.targetId || "N/A"}
                </td>
                <td className="max-w-75 truncate px-4 py-3 text-muted-foreground">
                  {log.details || "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-6 text-center text-sm text-muted-foreground">
          No logs found for your current search.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm">
        <div className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadLogs(Math.max(1, page - 1), limit)}
            disabled={isLoading || page <= 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadLogs(Math.min(totalPages, page + 1), limit)}
            disabled={isLoading || page >= totalPages}
          >
            Next
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
