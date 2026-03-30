import { getAdminEventsAction, getAllUsersAction } from "@/actions/admin"
import AdminDashboardWorkspace from "@/components/DashboardComponents/admin-dashboard-workspace"

export default async function AdminDashboardPage() {
  const [usersResult, eventsResult] = await Promise.all([
    getAllUsersAction(),
    getAdminEventsAction({ page: 1, limit: 10 }),
  ])

  return (
    <AdminDashboardWorkspace
      usersResult={usersResult}
      eventsResult={eventsResult}
    />
  )
}
