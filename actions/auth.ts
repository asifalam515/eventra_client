"use server"

import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type AuthActionState = {
  status: "idle" | "success" | "error"
  message: string
}

export type LoginActionState = AuthActionState
export type SignupActionState = AuthActionState

export async function loginAction(
  _preState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    if (!email || !password) {
      return {
        status: "error",
        message: "Email and password are required.",
      }
    }

    // Simulate authentication logic (replace with real API call)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-cache",
      }
    )
    if (!response.ok) {
      let errorMessage = "Invalid credentials. Please try again."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    const result = await response.json()
    const token = normalizeToken(
      result?.data?.token ??
        result?.token ??
        result?.data?.accessToken ??
        result?.accessToken
    )
    if (!token) {
      return {
        status: "error",
        message: "Login succeeded, but no valid token was returned by backend.",
      }
    }
    // Store token in a secure cookie (this is just a placeholder, implement securely)
    const cookieOptions = await cookies()
    cookieOptions.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: false, //will update
      sameSite: "lax", //will be update
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return { status: "success", message: "Login successful." }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed."
    return {
      status: "error",
      message,
    }
  }
}

export async function signupAction(
  _preState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  try {
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const photo = String(formData.get("photo") ?? "").trim()

    if (!name || !email || !password) {
      return {
        status: "error",
        message: "Name, email, and password are required.",
      }
    }

    const payload = {
      name,
      email,
      password,
      ...(photo ? { photo } : {}),
    }

    // Try register endpoint first, then fallback to signup if backend uses that naming.
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-cache",
      }
    )

    if (!response.ok && response.status === 404) {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-cache",
      })
    }

    if (!response.ok) {
      let errorMessage = "Signup failed. Please try again."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    const result = await response.json()
    const token = normalizeToken(
      result?.data?.token ??
        result?.token ??
        result?.data?.accessToken ??
        result?.accessToken
    )

    if (token) {
      const cookieOptions = await cookies()
      const isProduction = process.env.NODE_ENV === "production"
      cookieOptions.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return { status: "success", message: "Signup successful." }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed."
    return {
      status: "error",
      message,
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 0,
  })

  redirect("/login")
}
