"use client"

import { Button } from "@/components/ui/button"
import {
  downloadParticipantInvoice,
  downloadPaymentInvoice,
  handleInvoiceError,
  InvoiceDownloadError,
  openInvoiceInNewTab,
  type InvoiceKind,
} from "@/lib/invoice-service"
import { getClientToken } from "@/lib/token"
import { ExternalLink, FileText, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

type InvoiceDownloadButtonProps = {
  kind: InvoiceKind
  id: string
  token?: string
  mode?: "download" | "preview"
  label?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  className?: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export default function InvoiceDownloadButton({
  kind,
  id,
  token,
  mode = "download",
  label,
  size = "sm",
  variant = "outline",
  className,
  onSuccess,
  onError,
}: InvoiceDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const resolvedLabel = useMemo(() => {
    if (label) return label

    if (mode === "preview") {
      return "Preview Invoice"
    }

    return "Download Invoice"
  }, [label, mode])

  const run = async () => {
    const authToken = token || getClientToken() || undefined

    setIsLoading(true)

    try {
      if (mode === "preview") {
        await openInvoiceInNewTab(kind, id, authToken)
      } else if (kind === "payment") {
        await downloadPaymentInvoice(id, authToken)
      } else {
        await downloadParticipantInvoice(id, authToken)
      }

      const successMessage =
        mode === "preview"
          ? "Invoice opened in a new tab."
          : "Invoice downloaded successfully."
      setToast({ type: "success", message: successMessage })
      onSuccess?.(successMessage)
    } catch (error: unknown) {
      const message = handleInvoiceError(error)
      setToast({ type: "error", message })
      onError?.(message)

      if (error instanceof InvoiceDownloadError && error.status === 401) {
        const redirect = encodeURIComponent(window.location.pathname)
        window.setTimeout(() => {
          window.location.href = `/login?redirect=${redirect}`
        }, 900)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {toast ? (
        <div
          className={`fixed top-5 right-5 z-70 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={run}
        size={size}
        variant={variant}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading...
          </>
        ) : mode === "preview" ? (
          <>
            <ExternalLink className="mr-2 size-4" />
            {resolvedLabel}
          </>
        ) : (
          <>
            <FileText className="mr-2 size-4" />
            {resolvedLabel}
          </>
        )}
      </Button>
    </>
  )
}
