const INVALID_TOKEN_VALUES = new Set(["", "undefined", "null"])

export function normalizeToken(rawToken: string | undefined | null) {
  if (!rawToken) return null

  const tokenWithoutBearer = rawToken.replace(/^Bearer\s+/i, "").trim()
  if (INVALID_TOKEN_VALUES.has(tokenWithoutBearer)) return null

  return tokenWithoutBearer
}
