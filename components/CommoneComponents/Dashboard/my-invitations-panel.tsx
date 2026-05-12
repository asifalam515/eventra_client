"use client"

import {
  acceptInvitationAction,
  declineInvitationAction,
  type MyInvitation,
} from "@/actions/invitation"
import {
  confirmPaymentAction,
  createPaymentIntentAction,
} from "@/actions/payment"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import InvoiceDownloadButton from "@/components/ui/invoice-download-button"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react"
import { useMemo, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

type PaymentStage =
  | "idle"
  | "creating_intent"
  | "collecting_payment"
  | "confirming"
  | "requires_action"
  | "accepting"
  | "completed"
  | "failed"

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim()
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null

function stageLabel(stage: PaymentStage) {
  switch (stage) {
    case "creating_intent":
      return "Creating Payment Intent"
    case "collecting_payment":
      return "Collecting Payment"
    case "confirming":
      return "Confirming Payment"
    case "requires_action":
      return "Additional Action Required"
    case "accepting":
      return "Accepting Invitation"
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    default:
      return "Ready"
  }
}

function stageClass(stage: PaymentStage) {
  if (stage === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (stage === "failed") {
    return "border-red-200 bg-red-50 text-red-700"
  }
  if (stage === "requires_action") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  return "border-border/60 bg-muted/40 text-muted-foreground"
}

function prettyDate(input?: string) {
  if (!input) return "Date TBD"

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return "Date TBD"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function prettyMoney(amount?: number) {
  const value = typeof amount === "number" ? amount : Number(amount ?? 0)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function normalizedUpper(value?: string) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
}

function statusPillClass(status?: string) {
  const upper = normalizedUpper(status)

  if (upper === "ACCEPTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (upper === "DECLINED") {
    return "border-red-200 bg-red-50 text-red-700"
  }
  if (upper.includes("PENDING")) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-border/60 bg-muted/40 text-muted-foreground"
}

function paymentPillClass(payment?: string) {
  const upper = normalizedUpper(payment)

  if (upper === "PAID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (upper === "UNPAID") {
    return "border-red-200 bg-red-50 text-red-700"
  }

  return "border-border/60 bg-muted/40 text-muted-foreground"
}

function PaymentAcceptForm({
  invitation,
  fallbackTransactionId,
  onStageChange,
  onCompleted,
}: {
  invitation: MyInvitation
  fallbackTransactionId?: string
  onStageChange: (stage: PaymentStage) => void
  onCompleted: (message: string, data?: MyInvitation) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleElementLoadError = (event: { error?: { message?: string } }) => {
    const message =
      event.error?.message ||
      "Payment form failed to load. Please try again or use another browser."
    onStageChange("failed")
    setError(message)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError("Stripe is not initialized yet.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    onStageChange("collecting_payment")

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (result.error) {
        onStageChange("failed")
        setError(result.error.message || "Payment failed.")
        return
      }

      const transactionId =
        result.paymentIntent?.id || fallbackTransactionId || ""

      if (!transactionId) {
        onStageChange("failed")
        setError("Payment succeeded but transaction ID was not found.")
        return
      }

      onStageChange("confirming")
      const confirmResult = await confirmPaymentAction(transactionId)
      if (!confirmResult.success || !confirmResult.status) {
        onStageChange("failed")
        setError(confirmResult.message)
        return
      }

      if (confirmResult.status === "PENDING_ACTION") {
        if (!confirmResult.clientSecret) {
          onStageChange("failed")
          setError("Payment requires action but client secret is missing.")
          return
        }

        onStageChange("requires_action")
        const nextAction = await stripe.confirmCardPayment(
          confirmResult.clientSecret
        )

        if (nextAction.error) {
          onStageChange("failed")
          setError(
            nextAction.error.message || "Additional payment action failed."
          )
          return
        }

        const nextTransactionId =
          nextAction.paymentIntent?.id || transactionId || ""

        if (!nextTransactionId) {
          onStageChange("failed")
          setError("Payment action completed but transaction ID was not found.")
          return
        }

        onStageChange("confirming")
        const finalConfirm = await confirmPaymentAction(nextTransactionId)
        if (!finalConfirm.success || finalConfirm.status !== "PAID") {
          onStageChange("failed")
          setError(finalConfirm.message || "Payment was not completed.")
          return
        }
      }

      onStageChange("accepting")
      const acceptResult = await acceptInvitationAction(invitation.id)
      if (!acceptResult.success) {
        onStageChange("failed")
        setError(
          acceptResult.message ||
            "Payment completed, but invitation acceptance failed."
        )
        return
      }

      onStageChange("completed")
      onCompleted(
        acceptResult.message ||
          "Payment completed. Your invitation is now pending approval.",
        acceptResult.data
      )
    } catch (submitError: unknown) {
      onStageChange("failed")
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Payment process failed."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <PaymentElement
          options={{ layout: "tabs" }}
          onLoadError={handleElementLoadError}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 size-4" /> Pay & Accept Invitation
          </>
        )}
      </Button>
    </form>
  )
}

export default function MyInvitationsPanel({
  initialInvitations,
}: {
  initialInvitations: MyInvitation[]
}) {
  const [invitations, setInvitations] = useState(initialInvitations)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] =
    useState<MyInvitation | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | undefined>()
  const [intentError, setIntentError] = useState<string | null>(null)
  const [stage, setStage] = useState<PaymentStage>("idle")
  const [isIntentPending, startIntentTransition] = useTransition()

  const stripeMissing = !stripePublishableKey
  const stripeKeyInvalidFormat =
    Boolean(stripePublishableKey) &&
    !/^pk_(test|live)_/.test(stripePublishableKey)

  const elementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret || "",
      appearance: {
        theme: "stripe" as const,
      },
    }),
    [clientSecret]
  )

  const updateInvitation = (
    invitationId: string,
    partial: Partial<MyInvitation>
  ) => {
    setInvitations((prev) =>
      prev.map((item) =>
        item.id === invitationId
          ? {
              ...item,
              ...partial,
              event: partial.event ?? item.event,
            }
          : item
      )
    )
  }

  const handleAccept = (invitation: MyInvitation) => {
    startTransition(async () => {
      const result = await acceptInvitationAction(invitation.id)
      if (!result.success) {
        setToast({
          type: "error",
          message: result.message || "Failed to accept invitation.",
        })
        return
      }

      updateInvitation(invitation.id, {
        status:
          result.data?.status ||
          (normalizedUpper(invitation.status) === "PENDING"
            ? "PENDING_APPROVAL"
            : invitation.status || "PENDING_APPROVAL"),
        ...result.data,
      })

      setToast({
        type: "success",
        message:
          result.message || "Invitation accepted. Status is pending approval.",
      })
    })
  }

  const handleDecline = (invitation: MyInvitation) => {
    startTransition(async () => {
      const result = await declineInvitationAction(invitation.id)
      if (!result.success) {
        setToast({
          type: "error",
          message: result.message || "Failed to decline invitation.",
        })
        return
      }

      updateInvitation(invitation.id, {
        status: result.data?.status || "DECLINED",
        ...result.data,
      })

      setToast({
        type: "success",
        message: result.message || "Invitation declined.",
      })
    })
  }

  const handleOpenPaidAccept = (invitation: MyInvitation) => {
    setSelectedInvitation(invitation)
    setPaymentOpen(true)
    setIntentError(null)
    setClientSecret(null)
    setTransactionId(undefined)
    setStage("idle")

    startIntentTransition(async () => {
      setStage("creating_intent")
      const result = await createPaymentIntentAction(
        invitation.event?.id || invitation.eventId || ""
      )
      if (!result.success || !result.clientSecret) {
        setStage("failed")
        setIntentError(result.message || "Failed to initialize payment.")
        return
      }

      setClientSecret(result.clientSecret)
      setTransactionId(result.transactionId)
      setIntentError(null)
      setStage("collecting_payment")
    })
  }

  const closePaymentDialog = (nextOpen: boolean) => {
    setPaymentOpen(nextOpen)

    if (!nextOpen) {
      setSelectedInvitation(null)
      setIntentError(null)
      setClientSecret(null)
      setTransactionId(undefined)
      setStage("idle")
    }
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      {toast ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          My Invitations
        </h2>
        <span className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          {invitations.length} total
        </span>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          No invitations yet. You will find all incoming event invitations here.
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const status = normalizedUpper(invitation.status)
            const payment = normalizedUpper(invitation.payment)
            const eventFee = invitation.event?.fee ?? 0
            const isPaidEvent = eventFee > 0
            const isUnpaid = payment !== "PAID"
            const canRespond = status === "PENDING"

            return (
              <article
                key={invitation.id}
                className="rounded-xl border border-border/70 bg-background p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {invitation.event?.title || "Untitled event"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {invitation.event?.venue || "Venue TBD"} •{" "}
                      {prettyDate(
                        invitation.event?.date || invitation.createdAt
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${statusPillClass(
                        invitation.status
                      )}`}
                    >
                      {invitation.status || "UNKNOWN"}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${paymentPillClass(
                        invitation.payment
                      )}`}
                    >
                      Payment: {invitation.payment || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mb-4 text-sm text-muted-foreground">
                  {isPaidEvent
                    ? `Event Fee: ${prettyMoney(eventFee)}`
                    : "Free event invitation"}
                </div>

                {canRespond ? (
                  <div className="flex flex-wrap gap-2">
                    {isPaidEvent && isUnpaid ? (
                      <Button
                        onClick={() => handleOpenPaidAccept(invitation)}
                        disabled={isIntentPending || isPending}
                      >
                        <CreditCard className="mr-2 size-4" /> Pay & Accept
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleAccept(invitation)}
                        disabled={isPending}
                      >
                        <CheckCircle2 className="mr-2 size-4" /> Accept
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => handleDecline(invitation)}
                      disabled={isPending}
                    >
                      <XCircle className="mr-2 size-4" /> Decline
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This invitation is no longer actionable.
                  </p>
                )}

                {invitation.participantId || invitation.paymentId ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {invitation.participantId ? (
                      <InvoiceDownloadButton
                        kind="participant"
                        id={invitation.participantId}
                        label="Registration Invoice"
                      />
                    ) : null}

                    {invitation.paymentId ? (
                      <InvoiceDownloadButton
                        kind="payment"
                        id={invitation.paymentId}
                        label="Payment Invoice"
                      />
                    ) : null}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      <Dialog open={paymentOpen} onOpenChange={closePaymentDialog}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Pay & Accept Invitation</DialogTitle>
            <DialogDescription>
              Complete payment to accept your invitation for this paid event.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${stageClass(stage)}`}
          >
            {stageLabel(stage)}
          </div>

          {stripeMissing ? (
            <p className="text-sm text-red-600">
              Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment.
            </p>
          ) : stripeKeyInvalidFormat ? (
            <p className="text-sm text-red-600">
              Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Expected
              pk_test_... or pk_live_...
            </p>
          ) : isIntentPending && !clientSecret ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Initializing
              payment...
            </div>
          ) : intentError ? (
            <p className="text-sm text-red-600">{intentError}</p>
          ) : selectedInvitation && clientSecret ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentAcceptForm
                invitation={selectedInvitation}
                fallbackTransactionId={transactionId}
                onStageChange={setStage}
                onCompleted={(message, updatedInvitation) => {
                  updateInvitation(selectedInvitation.id, {
                    ...updatedInvitation,
                    payment: updatedInvitation?.payment || "PAID",
                    status: updatedInvitation?.status || "PENDING_APPROVAL",
                  })
                  setToast({ type: "success", message })
                  setPaymentOpen(false)
                }}
              />
            </Elements>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preparing payment form...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
