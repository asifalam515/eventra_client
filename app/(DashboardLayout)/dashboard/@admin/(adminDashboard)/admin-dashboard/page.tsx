import {
  getAdminActivityLogsAction,
  getAdminAnalyticsAction,
  getAdminEventsAction,
  getAllUsersAction,
} from "@/actions/admin"
import AdminDashboardWorkspace from "@/components/DashboardComponents/admin-dashboard-workspace"

export default async function AdminDashboardPage() {
  const [usersResult, eventsResult, analyticsResult, logsResult] =
    await Promise.all([
      getAllUsersAction(),
      getAdminEventsAction({ page: 1, limit: 10 }),
      getAdminAnalyticsAction(),
      getAdminActivityLogsAction({ page: 1, limit: 20 }),
    ])

  return (
    <AdminDashboardWorkspace
      usersResult={usersResult}
      eventsResult={eventsResult}
      analyticsResult={analyticsResult}
      logsResult={logsResult}
    />
  )
}
