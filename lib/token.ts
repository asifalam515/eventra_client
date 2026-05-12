const INVALID_TOKEN_VALUES = new Set(["", "undefined", "null"])
const TOKEN_COOKIE_NAME = "token"
const TOKEN_STORAGE_KEY = "eventra_token"
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export function normalizeToken(rawToken: string | undefined | null) {
  if (!rawToken) return null

  const tokenWithoutBearer = rawToken.replace(/^Bearer\s+/i, "").trim()
  if (INVALID_TOKEN_VALUES.has(tokenWithoutBearer)) return null

  return tokenWithoutBearer
}

export function persistClientToken(rawToken: string | undefined | null) {
  const token = normalizeToken(rawToken)
  if (!token || typeof window === "undefined") return null

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)

  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; samesite=lax${secure}`

  return token
}

export function clearClientToken() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

export function getClientToken() {
  if (typeof window === "undefined") return null

  const storageToken = normalizeToken(
    window.localStorage.getItem(TOKEN_STORAGE_KEY)
  )
  if (storageToken) return storageToken

  const cookieToken = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${TOKEN_COOKIE_NAME}=`))

  if (!cookieToken) return null

  const value = decodeURIComponent(cookieToken.split("=").slice(1).join("="))
  return normalizeToken(value)
}
