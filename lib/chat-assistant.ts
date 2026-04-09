import type { ChatApiResponse, ChatRequestBody, ChatResponseData } from "@/types/chat"

export async function sendChatMessage(
  payload: ChatRequestBody
): Promise<ChatResponseData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  let body: ChatApiResponse

  try {
    body = (await response.json()) as ChatApiResponse
  } catch {
    throw new Error("Failed to parse assistant response.")
  }

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Unable to fetch assistant reply.")
  }

  return body.data
}
