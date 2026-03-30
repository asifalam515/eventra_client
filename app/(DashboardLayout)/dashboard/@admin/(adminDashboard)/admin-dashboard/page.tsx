import { getAdminEventsAction, getAllUsersAction } from "@/actions/admin"
import AdminEventsPanel from "@/components/DashboardComponents/admin-events-panel"
import AdminUsersPanel from "@/components/DashboardComponents/admin-users-panel"

export default async function AdminDashboardPage() {
  const [usersResult, eventsResult] = await Promise.all([
    getAllUsersAction(),
    getAdminEventsAction({ page: 1, limit: 10 }),
  ])

  return (
    <div className="space-y-8">
      <AdminUsersPanel
        initialUsers={usersResult.data}
        initialMessage={usersResult.message}
        initialMessageType={usersResult.success ? "success" : "error"}
      />

      <AdminEventsPanel
        initialEvents={eventsResult.data}
        initialMessage={eventsResult.message}
        initialMessageType={eventsResult.success ? "success" : "error"}
      />
    </div>
  )
}
