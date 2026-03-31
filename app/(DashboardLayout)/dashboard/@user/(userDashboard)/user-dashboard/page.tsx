import { getMyInvitationsAction } from "@/actions/invitation"
import DashboardProfileSection from "@/components/CommoneComponents/Dashboard/dashboard-profile-section"

export default async function UserDashboardPage() {
  const invitationsResult = await getMyInvitationsAction()

  return (
    <DashboardProfileSection
      title="Dashboard"
      subtitle="Here is your profile information."
      initialInvitations={
        invitationsResult.success ? invitationsResult.data : []
      }
    />
  )
}
