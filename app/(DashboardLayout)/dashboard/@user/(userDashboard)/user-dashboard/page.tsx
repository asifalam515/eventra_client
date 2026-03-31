import { getMyEventsAction } from "@/actions/event"
import { getMyInvitationsAction } from "@/actions/invitation"
import UserDashboardWorkspace from "@/components/DashboardComponents/user-dashboard-workspace"

export default async function UserDashboardPage() {
  const [invitationsResult, eventsResult] = await Promise.all([
    getMyInvitationsAction(),
    getMyEventsAction(),
  ])

  return (
    <UserDashboardWorkspace
      initialEvents={eventsResult.success ? eventsResult.data : []}
      initialInvitations={
        invitationsResult.success ? invitationsResult.data : []
      }
    />
  )
}
