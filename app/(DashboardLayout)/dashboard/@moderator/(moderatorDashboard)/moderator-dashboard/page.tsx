import { getMyInvitationsAction } from "@/actions/invitation"
import DashboardProfileSection from "@/components/CommoneComponents/Dashboard/dashboard-profile-section"

export default async function ModeratorDashboardPage() {
  const invitationsResult = await getMyInvitationsAction()

  return (
    <DashboardProfileSection
      title="Moderator Dashboard"
      subtitle="You have moderator privileges."
      initialInvitations={
        invitationsResult.success ? invitationsResult.data : []
      }
    />
  )
}
