"use client"

import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/ui/event-card"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

type EventStatus = "upcoming" | "ongoing" | "completed"

interface EventItem {
  id: string
  name?: string
  description?: string
  date?: string
  venue?: string
  eventStatus?: EventStatus | string
  fee?: string | number
  review?: number
  type?: string
  attendees?: number
}

interface EventsBrowserProps {
  events: EventItem[]
  initialSearchTerm?: string
}

const EVENTS_PER_PAGE = 12

function normalizeEventStatus(
  status?: EventStatus | string
): EventStatus | undefined {
  if (!status) return undefined

  const normalized = status.toLowerCase()

  if (
    normalized === "upcoming" ||
    normalized === "ongoing" ||
    normalized === "completed"
  ) {
    return normalized
  }

  return undefined
}

export function EventsBrowser({
  events,
  initialSearchTerm = "",
}: EventsBrowserProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [feeRange, setFeeRange] = useState<{ min: number; max: number } | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)

  const parseFee = (fee?: string | number) => {
    if (typeof fee === "number") return Number.isFinite(fee) ? fee : 0
    if (typeof fee !== "string") return 0

    const normalized = fee.replace(/,/g, "")
    const match = normalized.match(/\d+(?:\.\d+)?/)
    const parsed = match ? Number.parseFloat(match[0]) : 0

    return Number.isFinite(parsed) ? parsed : 0
  }

  const availableTypes = useMemo(() => {
    const uniqueTypes = new Set<string>()

    for (const event of events) {
      const normalizedType = (event.type ?? "").trim().toLowerCase()
      if (normalizedType) {
        uniqueTypes.add(normalizedType)
      }
    }

    return Array.from(uniqueTypes).sort((a, b) => a.localeCompare(b))
  }, [events])

  const feeBounds = useMemo(() => {
    const fees = events.map((event) => parseFee(event.fee))
    const max = fees.length > 0 ? Math.ceil(Math.max(...fees)) : 0
    const min = fees.length > 0 ? Math.floor(Math.min(...fees)) : 0

    return { min, max }
  }, [events])

  const effectiveFeeRange = feeRange ?? feeBounds

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return events.filter((event) => {
      const normalizedName = (event.name ?? "").toLowerCase()
      const normalizedDescription = (event.description ?? "").toLowerCase()
      const normalizedType = (event.type ?? "").trim().toLowerCase()
      const eventFee = parseFee(event.fee)

      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizedName.includes(normalizedSearch) ||
        normalizedDescription.includes(normalizedSearch)

      const eventStatus = normalizeEventStatus(event.eventStatus) || "upcoming"

      const matchesStatus =
        statusFilter === "all" ? true : eventStatus === statusFilter

      const matchesType =
        typeFilter === "all" ? true : normalizedType === typeFilter

      const matchesFee =
        eventFee >= effectiveFeeRange.min && eventFee <= effectiveFeeRange.max

      return matchesSearch && matchesStatus && matchesType && matchesFee
    })
  }, [events, searchTerm, statusFilter, typeFilter, effectiveFeeRange])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  )
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * EVENTS_PER_PAGE
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + EVENTS_PER_PAGE
  )

  const applySearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const applyStatusFilter = (value: "all" | EventStatus) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const applyTypeFilter = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const applyMinFeeFilter = (value: number) => {
    setFeeRange((prev) => {
      const current = prev ?? feeBounds
      const nextMin = Math.min(value, current.max)
      return { min: nextMin, max: current.max }
    })
    setCurrentPage(1)
  }

  const applyMaxFeeFilter = (value: number) => {
    setFeeRange((prev) => {
      const current = prev ?? feeBounds
      const nextMax = Math.max(value, current.min)
      return { min: current.min, max: nextMax }
    })
    setCurrentPage(1)
  }

  const resetFeeFilter = () => {
    setFeeRange(null)
    setCurrentPage(1)
  }

  const formatFee = (value: number) => `$${value.toFixed(0)}`

  const sliderClassName =
    "pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent outline-none disabled:opacity-40 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-110 focus:[&::-webkit-slider-thumb]:ring-2 focus:[&::-webkit-slider-thumb]:ring-primary/30 [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary"

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/40 p-4 sm:p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Input
              value={searchTerm}
              onChange={(e) => applySearch(e.target.value)}
              placeholder="Search events by name or vibe..."
              className="w-full rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-6 text-base shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                applyStatusFilter(e.target.value as "all" | EventStatus)
              }
              className="h-12 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <option value="all">Any Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => applyTypeFilter(e.target.value)}
              className="h-12 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <option value="all">Any Category</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6">
          <div className="flex w-full max-w-sm flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-foreground">
                Price Range
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary">
                  {formatFee(effectiveFeeRange.min)} - {formatFee(effectiveFeeRange.max)}
                </span>
                {feeRange && (
                  <button
                    type="button"
                    onClick={resetFeeFilter}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="relative h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <input
                type="range"
                min={feeBounds.min}
                max={feeBounds.max}
                step={1}
                value={effectiveFeeRange.min}
                onChange={(e) => applyMinFeeFilter(Number(e.target.value))}
                disabled={feeBounds.max === feeBounds.min}
                className={sliderClassName}
                aria-label="Minimum fee"
              />

              <input
                type="range"
                min={feeBounds.min}
                max={feeBounds.max}
                step={1}
                value={effectiveFeeRange.max}
                onChange={(e) => applyMaxFeeFilter(Number(e.target.value))}
                disabled={feeBounds.max === feeBounds.min}
                className={sliderClassName}
                aria-label="Maximum fee"
              />
            </div>
          </div>
        </div>
      </div>

      {paginatedEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={{
                ...event,
                name: event.name ?? "Untitled Event",
                description: event.description ?? "No description available",
                eventStatus:
                  normalizeEventStatus(event.eventStatus) || "upcoming",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-12 text-center">
          <h3 className="mb-2 text-xl font-semibold text-foreground">No experiences found</h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your filters or search terms to discover more events.
          </p>
          <Button onClick={resetFeeFilter} variant="outline" className="mt-6 rounded-full">
            Clear all filters
          </Button>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-6 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8 sm:flex-row px-4">
          <p className="text-sm font-medium text-muted-foreground">
            Showing <span className="text-foreground">{paginatedEvents.length}</span> of <span className="text-foreground">{filteredEvents.length}</span> events
          </p>

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-full px-4"
            >
              Previous
            </Button>

            <span className="min-w-[4rem] text-center text-sm font-semibold text-foreground">
              {safeCurrentPage} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
              className="rounded-full px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
