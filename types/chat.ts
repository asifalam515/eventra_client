export type ChatMatchedEvent = {
  id: string
  title: string
  date: string
  time: string
  venue: string
  fee: number
  type: "PUBLIC" | "PRIVATE"
  averageRating: number
  reviewCount: number
  isFeatured: boolean
  eventStatus: "AVAILABLE" | "COMPLETED" | "CANCELLED" | "EXPIRED"
}

export type ChatRequestBody = {
  message: string
  sessionId?: string
}

export type ChatResponseData = {
  sessionId: string
  reply: string
  historyUsed: number
  matchedEvents: ChatMatchedEvent[]
}

export type ChatApiResponse = {
  success: boolean
  message: string
  data?: ChatResponseData
}
