"use client"

import type { ChatMatchedEvent } from "@/types/chat"
import { Star } from "lucide-react"

export type UiChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  matchedEvents?: ChatMatchedEvent[]
}

type ChatMessageListProps = {
  messages: UiChatMessage[]
  isLoading: boolean
}

function formatEventDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function formatFee(fee: number) {
  if (!Number.isFinite(fee) || fee <= 0) return "Free"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(fee)
}

function EventMatchCard({ event }: { event: ChatMatchedEvent }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold text-foreground">
          {event.title}
        </h4>
        {event.isFeatured && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 uppercase">
            Featured
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <p>{formatEventDate(event.date)}</p>
        <p>{event.venue}</p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{formatFee(event.fee)}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          {event.averageRating.toFixed(1)} ({event.reviewCount})
        </span>
      </div>
    </div>
  )
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Ask Eventra Assistant
          </h3>
          <p className="text-sm text-muted-foreground">
            Try: "Find me free tech events this week" or "Which event is best
            for networking?"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 bg-card text-card-foreground"
            }`}
          >
            <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>

            {message.role === "assistant" &&
              message.matchedEvents &&
              message.matchedEvents.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {message.matchedEvents.map((event) => (
                    <EventMatchCard key={event.id} event={event} />
                  ))}
                </div>
              )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
            <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
            <span>Thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
