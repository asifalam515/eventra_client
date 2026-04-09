"use client"

import { Button } from "@/components/ui/button"
import { sendChatMessage } from "@/lib/chat-assistant"
import { AlertCircle, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ChatInput } from "./chat-input"
import { ChatMessageList, type UiChatMessage } from "./chat-message-list"

const CHAT_SESSION_KEY = "eventra-assistant-session-id"

function makeMessageId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ChatAssistant() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<UiChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [lastMessageForRetry, setLastMessageForRetry] = useState<string | null>(
    null
  )

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const savedSessionId = window.localStorage.getItem(CHAT_SESSION_KEY)
    if (savedSessionId) {
      setSessionId(savedSessionId)
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    window.localStorage.setItem(CHAT_SESSION_KEY, sessionId)
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isLoading])

  const headerSubtitle = useMemo(() => {
    if (!sessionId)
      return "Start a conversation to get personalized recommendations."
    return "Conversation memory is active for this assistant session."
  }, [sessionId])

  const runMessage = async (
    rawMessage: string,
    options?: { skipUserBubble?: boolean }
  ) => {
    const message = rawMessage.trim()
    if (!message || isLoading) return

    if (!options?.skipUserBubble) {
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId(),
          role: "user",
          content: message,
        },
      ])
    }

    setErrorText(null)
    setLastMessageForRetry(message)
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        message,
        sessionId,
      })

      setSessionId(response.sessionId)
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId(),
          role: "assistant",
          content: response.reply,
          matchedEvents: response.matchedEvents,
        },
      ])
      setInput("")
    } catch (error: unknown) {
      const messageText =
        error instanceof Error
          ? error.message
          : "The assistant request failed. Please try again."
      setErrorText(messageText)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => {
    void runMessage(input)
  }

  const handleRetry = () => {
    if (!lastMessageForRetry) return
    void runMessage(lastMessageForRetry, { skipUserBubble: true })
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-background via-muted/30 to-background p-4 shadow-xl sm:p-6 lg:p-8">
      <div className="absolute -top-20 -right-10 size-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-8 size-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Eventra AI Assistant
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {headerSubtitle}
          </p>
        </header>

        {errorText && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="inline-flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorText}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isLoading || !lastMessageForRetry}
              className="shrink-0"
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        )}

        <div className="h-[55vh] min-h-[360px] overflow-y-auto rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
          <ChatMessageList messages={messages} isLoading={isLoading} />
          <div ref={bottomRef} />
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          disabled={isLoading}
          placeholder="Ask about free events, recommendations, schedules, and more..."
        />
      </div>
    </section>
  )
}
