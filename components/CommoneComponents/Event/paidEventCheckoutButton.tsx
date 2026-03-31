"use client"

import { joinParticipationByEventIdAction } from "@/actions/participation"
import {
  confirmPaymentAction,
  createPaymentIntentAction,
} from "@/actions/payment"
import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCard, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim()
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null

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
  | "approving_participation"
  | "completed"
  | "failed"

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
    case "approving_participation":
      return "Approving Participation"
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    default:
      return "Ready"
  }
}

function stageClass(stage: PaymentStage) {
  if (stage === "completed")
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (stage === "failed") return "border-red-200 bg-red-50 text-red-700"
  if (stage === "requires_action")
    return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-border/60 bg-muted/40 text-muted-foreground"
}

function PaymentForm({
  eventId,
  userId,
  userName,
  userEmail,
  fallbackTransactionId,
  onSuccess,
  onStageChange,
}: {
  eventId: string
  userId?: string
  userName?: string
  userEmail?: string
  fallbackTransactionId?: string
  onSuccess: (message: string) => void
  onStageChange: (stage: PaymentStage) => void
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

      if (
        confirmResult.status !== "PAID" &&
        confirmResult.status !== "PENDING_ACTION"
      ) {
        onStageChange("failed")
        setError("Unexpected payment status from server.")
        return
      }

      const joinResult = await joinParticipationByEventIdAction(eventId)
      if (!joinResult.status || joinResult.status !== "success") {
        onStageChange("failed")
        setError(
          joinResult.message || "Payment succeeded but join request failed."
        )
        return
      }

      onStageChange("completed")
      onSuccess(
        "Payment successful! Your join request has been sent. Please wait for the event organizer to approve your participation."
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

      {error && <p className="text-sm text-red-600">{error}</p>}

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
            <CreditCard className="mr-2 size-4" /> Pay & Join Event
          </>
        )}
      </Button>
    </form>
  )
}

export default function PaidEventCheckoutButton({
  eventId,
  amountLabel,
}: {
  eventId: string
  amountLabel: string
}) {
  const { user } = useUserContext()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | undefined>()
  const [intentError, setIntentError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
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

  useEffect(() => {
    if (!open || clientSecret || stripeMissing) return

    startIntentTransition(async () => {
      setStage("creating_intent")
      const result = await createPaymentIntentAction(eventId)
      if (!result.success || !result.clientSecret) {
        setStage("failed")
        setIntentError(result.message || "Failed to initialize payment.")
        return
      }

      setClientSecret(result.clientSecret)
      setTransactionId(result.transactionId)
      setStage("collecting_payment")
      setIntentError(null)
    })
  }, [open, clientSecret, stripeMissing, eventId])

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSuccess = (message: string) => {
    setToast({ type: "success", message })
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-70 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Button onClick={() => setOpen(true)}>
        <CreditCard className="size-4" /> Pay {amountLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setIntentError(null)
            setStage("idle")
            setClientSecret(null)
            setTransactionId(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Complete Stripe Payment</DialogTitle>
            <DialogDescription>
              This is a paid event ({amountLabel}). Complete payment to join.
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
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm
                eventId={eventId}
                userId={user?.id}
                userName={user?.name}
                userEmail={user?.email}
                fallbackTransactionId={transactionId}
                onSuccess={handleSuccess}
                onStageChange={setStage}
              />
            </Elements>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preparing payment form...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
