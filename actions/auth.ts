"use server"

type LoginState = {
  email: string
  password: string
}

export async function loginAction(
  _preState: LoginState | null,
  formData: FormData
) {
  try {
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    console.log(email, password, _preState)
    return { email, password }
  } catch (error: unknown) {
    console.log(error)
    return { email: "", password: "" }
  }
}
