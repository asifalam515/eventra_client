export const PARTICIPATION_STATUS_UPDATED_EVENT = "participation-status-updated"

export type ParticipationStatusUpdatedDetail = {
  eventId: string
  userId: string
  status: string
  userName?: string
  userEmail?: string
  createdAt?: string
}
