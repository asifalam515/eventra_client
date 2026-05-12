"use client"

import { Button } from "@/components/ui/button"
import InvoiceDownloadButton from "@/components/ui/invoice-download-button"
import { CreditCard, FileText, Loader2, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type ViewMode = "registrations" | "payments"

type RegistrationItem = {
  id: string
  status: string
  paymentStatus: string
  createdAt?: string
  eventTitle?: string
  eventDate?: string
  eventVenue?: string
  fee?: number
}

type PaymentItem = {
  id: string
  status: string
  amount?: number
  currency?: string
  createdAt?: string
  transactionId?: string
  eventTitle?: string
}

type UserInvoicesPanelProps = {
  initialView: ViewMode
}

function formatDate(value?: string) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatAmount(amount?: number, currency?: string) {
  const value = typeof amount === "number" ? amount : Number(amount ?? 0)
  const code = (currency || "USD").toUpperCase()

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function normalizeStatus(value?: string) {
  return String(value ?? "UNKNOWN").toUpperCase()
}

function extractArray(body: unknown): unknown[] {
  if (Array.isArray(body)) return body

  if (!body || typeof body !== "object") return []

  const payload = body as Record<string, unknown>
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.results)) return payload.results

  const nestedData = payload.data
  if (nestedData && typeof nestedData === "object") {
    const nested = nestedData as Record<string, unknown>
    if (Array.isArray(nested.items)) return nested.items
    if (Array.isArray(nested.results)) return nested.results
    if (Array.isArray(nested.participations)) return nested.participations
    if (Array.isArray(nested.payments)) return nested.payments
  }

  return []
}

function mapRegistration(
  payload: Record<string, unknown>
): RegistrationItem | null {
  const event =
    (payload.event as Record<string, unknown> | undefined) ??
    (payload.eventInfo as Record<string, unknown> | undefined)

  const id = String(payload.id ?? payload._id ?? payload.participantId ?? "")
  if (!id) return null

  return {
    id,
    status: normalizeStatus(
      String(payload.status ?? payload.participationStatus ?? "PENDING")
    ),
    paymentStatus: normalizeStatus(
      String(payload.payment ?? payload.paymentStatus ?? "UNPAID")
    ),
    createdAt: String(payload.createdAt ?? payload.joinedAt ?? "") || undefined,
    eventTitle:
      String(event?.title ?? event?.name ?? payload.eventTitle ?? "") ||
      "Untitled Event",
    eventDate: String(event?.date ?? payload.eventDate ?? "") || undefined,
    eventVenue:
      String(event?.venue ?? event?.location ?? payload.eventVenue ?? "") ||
      undefined,
    fee:
      typeof event?.fee === "number"
        ? event.fee
        : Number(event?.fee ?? payload.fee ?? 0) || 0,
  }
}

function mapPayment(payload: Record<string, unknown>): PaymentItem | null {
  const event =
    (payload.event as Record<string, unknown> | undefined) ??
    (payload.eventInfo as Record<string, unknown> | undefined)

  const id = String(
    payload.id ??
      payload._id ??
      payload.paymentId ??
      payload.transactionId ??
      ""
  )
  if (!id) return null

  return {
    id,
    status: normalizeStatus(
      String(payload.status ?? payload.paymentStatus ?? "UNKNOWN")
    ),
    amount:
      typeof payload.amount === "number"
        ? payload.amount
        : Number(payload.amount ?? payload.total ?? 0) || 0,
    currency: String(payload.currency ?? "USD") || "USD",
    createdAt:
      String(payload.createdAt ?? payload.updatedAt ?? "") || undefined,
    transactionId:
      String(payload.transactionId ?? payload.stripeTransactionId ?? "") ||
      undefined,
    eventTitle:
      String(event?.title ?? event?.name ?? payload.eventTitle ?? "") ||
      "Event Payment",
  }
}

export default function UserInvoicesPanel({
  initialView,
}: UserInvoicesPanelProps) {
  const [activeView, setActiveView] = useState<ViewMode>(initialView)
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/invoice/dashboard", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      })

      const body = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            String(
              body?.message ?? "Your session expired. Please log in again."
            )
          )
          return
        }

        setError(
          String(
            body?.message ?? "Unable to load invoices right now. Please retry."
          )
        )
        return
      }

      const registrationsRaw =
        (body?.registrations as Record<string, unknown> | unknown[] | null) ??
        null
      const paymentsRaw =
        (body?.payments as Record<string, unknown> | unknown[] | null) ?? null

      const mappedRegistrations = extractArray(registrationsRaw)
        .map((item) =>
          item && typeof item === "object"
            ? mapRegistration(item as Record<string, unknown>)
            : null
        )
        .filter((item): item is RegistrationItem => Boolean(item))

      const mappedPayments = extractArray(paymentsRaw)
        .map((item) =>
          item && typeof item === "object"
            ? mapPayment(item as Record<string, unknown>)
            : null
        )
        .filter((item): item is PaymentItem => Boolean(item))

      setRegistrations(mappedRegistrations)
      setPayments(mappedPayments)
    } catch {
      setError("Unable to load invoices right now. Please retry.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    setActiveView(initialView)
  }, [initialView])

  const sectionTitle = useMemo(
    () =>
      activeView === "registrations" ? "My Registrations" : "Payment History",
    [activeView]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          {sectionTitle}
        </h2>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeView === "registrations" ? "default" : "outline"}
            onClick={() => setActiveView("registrations")}
          >
            <FileText className="mr-2 size-4" /> Registrations
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeView === "payments" ? "default" : "outline"}
            onClick={() => setActiveView("payments")}
          >
            <CreditCard className="mr-2 size-4" /> Payments
          </Button>

          <Button type="button" size="sm" variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading invoice data...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : activeView === "registrations" ? (
        registrations.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            No registration records found.
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/70 bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.eventTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.eventVenue || "Venue TBD"} •{" "}
                      {formatDate(item.eventDate || item.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {item.status} • Payment: {item.paymentStatus}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <InvoiceDownloadButton
                      kind="participant"
                      id={item.id}
                      label="Download Invoice"
                    />
                    <InvoiceDownloadButton
                      kind="participant"
                      id={item.id}
                      label="Preview"
                      mode="preview"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          No payment history found.
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border/70 bg-background p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.eventTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatAmount(item.amount, item.currency)} •{" "}
                    {formatDate(item.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: {item.status}
                    {item.transactionId ? ` • Txn: ${item.transactionId}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <InvoiceDownloadButton
                    kind="payment"
                    id={item.id}
                    label="Download Invoice"
                  />
                  <InvoiceDownloadButton
                    kind="payment"
                    id={item.id}
                    label="Preview"
                    mode="preview"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
