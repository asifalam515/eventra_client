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

const EVENTS_PER_PAGE = 5

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
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border/60 bg-card/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchTerm}
            onChange={(e) => applySearch(e.target.value)}
            placeholder="Search events by name or description"
            className="sm:max-w-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              applyStatusFilter(e.target.value as "all" | EventStatus)
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => applyTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Fee Range
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-border/70 bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {formatFee(effectiveFeeRange.min)} -{" "}
                {formatFee(effectiveFeeRange.max)}
              </span>
              <button
                type="button"
                onClick={resetFeeFilter}
                className="text-[11px] font-medium text-primary transition-opacity hover:opacity-80"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="relative h-1.5 rounded-full bg-linear-to-r from-primary/20 via-primary/40 to-primary/20">
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

      {paginatedEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground">
          No events match your current filters.
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedEvents.length} of {filteredEvents.length} events
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </Button>

          <span className="min-w-20 text-center text-sm font-medium text-foreground">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
