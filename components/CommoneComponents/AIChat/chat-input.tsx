"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SendHorizonal } from "lucide-react"
import { KeyboardEvent } from "react"

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: ChatInputProps) {
  const canSend = value.trim().length > 0 && !disabled

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return

    event.preventDefault()
    if (canSend) onSubmit()
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Ask anything about events..."}
        rows={3}
        className={cn(
          "w-full resize-none rounded-xl border border-border/60 bg-background px-3 py-2 text-sm transition outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/40",
          disabled ? "opacity-70" : ""
        )}
        disabled={disabled}
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Enter to send, Shift+Enter for newline
        </p>
        <Button type="button" onClick={onSubmit} disabled={!canSend}>
          {disabled ? (
            "Sending..."
          ) : (
            <span className="inline-flex items-center gap-2">
              <SendHorizonal className="size-4" />
              Send
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
