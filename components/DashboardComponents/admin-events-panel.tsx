"use client"

import {
  AdminEvent,
  deleteAdminEventAction,
  featureAdminEventAction,
  getAdminEventByIdAction,
  getAdminEventsAction,
  updateAdminEventStatusAction,
} from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Sparkles, Star, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

type FilterState = {
  page: number
  limit: number
  search: string
  type: string
  isFeatured: string
}

type EventStatusOption = "UPCOMING" | "ONGOING" | "COMPLETED"

const EVENT_STATUS_OPTIONS: EventStatusOption[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
]

function normalizeEventStatus(status?: string): EventStatusOption {
  const normalized = status?.trim().toUpperCase()

  if (
    normalized === "UPCOMING" ||
    normalized === "ONGOING" ||
    normalized === "COMPLETED"
  ) {
    return normalized
  }

  return "UPCOMING"
}

function formatDate(value?: string) {
  if (!value) return "N/A"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

export default function AdminEventsPanel({
  initialEvents,
  initialMessage,
  initialMessageType,
}: {
  initialEvents: AdminEvent[]
  initialMessage?: string
  initialMessageType?: "success" | "error"
}) {
  const [events, setEvents] = useState<AdminEvent[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)
  const [queryId, setQueryId] = useState("")
  const [toast, setToast] = useState<ToastState | null>(() => {
    if (!initialMessage || !initialMessageType) return null

    return {
      type: initialMessageType,
      message: initialMessage,
    }
  })
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    isFeatured: "",
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

  const featuredCount = useMemo(
    () => events.filter((item) => item.isFeatured).length,
    [events]
  )

  const paidCount = useMemo(
    () => events.filter((item) => Number(item.fee || 0) > 0).length,
    [events]
  )

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    startFetchTransition(async () => {
      const result = await getAdminEventsAction({
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 10,
        search: filters.search.trim() || undefined,
        type: filters.type.trim() || undefined,
        isFeatured:
          filters.isFeatured === "" ? undefined : filters.isFeatured === "true",
      })

      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setEvents(result.data)
      showToast("success", result.message)
    })
  }

  const handleFindById = () => {
    startFetchTransition(async () => {
      const result = await getAdminEventByIdAction(queryId)

      if (!result.success || !result.data) {
        showToast("error", result.message || "Event not found.")
        setSelectedEvent(null)
        return
      }

      setSelectedEvent(result.data)
      showToast("success", "Event found.")
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    startMutatingTransition(async () => {
      const result = await deleteAdminEventAction(eventId)

      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setEvents((prev) => prev.filter((item) => item.id !== eventId))
      setSelectedEvent((prev) => (prev?.id === eventId ? null : prev))
      showToast("success", result.message)
    })
  }

  const handleFeatureEvent = (eventId: string) => {
    startMutatingTransition(async () => {
      const result = await featureAdminEventAction(eventId, true)

      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventId ? { ...item, isFeatured: true } : item
        )
      )

      setSelectedEvent((prev) =>
        prev && prev.id === eventId ? { ...prev, isFeatured: true } : prev
      )

      showToast("success", result.message)
    })
  }

  const handleUpdateEventStatus = (
    eventId: string,
    eventStatus: EventStatusOption
  ) => {
    startMutatingTransition(async () => {
      const result = await updateAdminEventStatusAction(eventId, eventStatus)

      if (!result.success) {
        showToast("error", result.message)
        return
      }

      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventId ? { ...item, status: eventStatus } : item
        )
      )

      setSelectedEvent((prev) =>
        prev && prev.id === eventId ? { ...prev, status: eventStatus } : prev
      )

      showToast("success", result.message)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Admin Events Management
        </h2>
        <p className="text-sm text-slate-600">
          Filter events, fetch any event by ID, and delete inappropriate events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Total Events</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {events.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Featured Events</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">
            {featuredCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-xs text-slate-500">Paid Events</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-700">
            {paidCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search by title"
            className="bg-white"
          />

          <Input
            type="number"
            min={1}
            value={filters.page}
            onChange={(e) =>
              handleFilterChange("page", Number(e.target.value) || 1)
            }
            placeholder="Page"
            className="bg-white"
          />

          <Input
            type="number"
            min={1}
            value={filters.limit}
            onChange={(e) =>
              handleFilterChange("limit", Number(e.target.value) || 10)
            }
            placeholder="Limit"
            className="bg-white"
          />

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">All Types</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>

          <select
            value={filters.isFeatured}
            onChange={(e) => handleFilterChange("isFeatured", e.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">All Featured</option>
            <option value="true">Featured = true</option>
            <option value="false">Featured = false</option>
          </select>
        </div>

        <div className="mt-3 flex gap-2">
          <Button onClick={handleApplyFilters} disabled={isFetching}>
            {isFetching ? "Filtering..." : "Apply Filters"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                page: 1,
                limit: 10,
                search: "",
                type: "",
                isFeatured: "",
              })
              setTimeout(() => handleApplyFilters(), 0)
            }}
            disabled={isFetching}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search className="size-4 text-slate-500" />
            <Input
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Fetch event by ID"
              className="bg-white"
            />
          </div>
          <Button
            onClick={handleFindById}
            disabled={isFetching || !queryId.trim()}
          >
            {isFetching ? "Searching..." : "Find Event"}
          </Button>
        </div>
      </div>

      {selectedEvent && (
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Selected Event
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {selectedEvent.type || "N/A"}
            </span>
          </div>

          <div className="grid gap-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Title:</span> {selectedEvent.title}
            </p>
            <p>
              <span className="font-medium">Event Status:</span>{" "}
              {selectedEvent.status || "N/A"}
            </p>
            <p>
              <span className="font-medium">Venue:</span>{" "}
              {selectedEvent.venue || "N/A"}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedEvent.date)}
            </p>
            <p>
              <span className="font-medium">Fee:</span> {selectedEvent.fee ?? 0}
            </p>
            <p>
              <span className="font-medium">ID:</span> {selectedEvent.id}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={normalizeEventStatus(selectedEvent.status)}
              onChange={(e) =>
                handleUpdateEventStatus(
                  selectedEvent.id,
                  e.target.value as EventStatusOption
                )
              }
              disabled={isMutating}
              className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            >
              {EVENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {!selectedEvent.isFeatured && (
              <Button
                variant="secondary"
                onClick={() => handleFeatureEvent(selectedEvent.id)}
                disabled={isMutating}
              >
                <Sparkles className="size-4" />
                {isMutating ? "Updating..." : "Mark as Featured"}
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              disabled={isMutating}
            >
              <Trash2 className="size-4" />
              {isMutating ? "Deleting..." : "Delete Event"}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Calendar className="size-4" /> All Events
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Event Status</th>
                <th className="px-4 py-2 font-medium">Featured</th>
                <th className="px-4 py-2 font-medium">Fee</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.type || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700">
                      {item.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        <Star className="size-3" /> Yes
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.fee ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={normalizeEventStatus(item.status)}
                        onChange={(e) =>
                          handleUpdateEventStatus(
                            item.id,
                            e.target.value as EventStatusOption
                          )
                        }
                        disabled={isMutating}
                        className="h-8 rounded-md border border-input bg-white px-2 text-xs"
                      >
                        {EVENT_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {!item.isFeatured && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFeatureEvent(item.id)}
                          disabled={isMutating}
                        >
                          <Sparkles className="size-4" /> Feature
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvent(item.id)}
                        disabled={isMutating}
                      >
                        <Trash2 className="size-4" /> Delete
                      </Button>
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
