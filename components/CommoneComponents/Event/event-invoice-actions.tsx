"use client"

import InvoiceDownloadButton from "@/components/ui/invoice-download-button"

type EventInvoiceActionsProps = {
  participantId?: string
  paymentId?: string
}

export default function EventInvoiceActions({
  participantId,
  paymentId,
}: EventInvoiceActionsProps) {
  if (!participantId && !paymentId) {
    return null
  }

  return (
    <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
      <p className="mb-3 text-sm font-medium text-foreground">Invoices</p>

      <div className="flex flex-wrap gap-2">
        {participantId ? (
          <InvoiceDownloadButton
            kind="participant"
            id={participantId}
            label="Download Registration Invoice"
          />
        ) : null}

        {paymentId ? (
          <InvoiceDownloadButton
            kind="payment"
            id={paymentId}
            label="Download Payment Invoice"
          />
        ) : null}
      </div>
    </div>
  )
}
