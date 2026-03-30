"use client"

import ProfileCard from "@/components/CommoneComponents/Dashboard/ProfileCard"
import { useUserContext } from "@/components/providers/user-provider"

type DashboardProfileSectionProps = {
  title: string
  subtitle: string
}

export default function DashboardProfileSection({
  title,
  subtitle,
}: DashboardProfileSectionProps) {
  const { user } = useUserContext()

  if (!user) return null

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-600">
            Welcome back, {user.name}! {subtitle}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Profile Information
          </h2>
          <ProfileCard />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for future dashboard widgets */}
        </div>
      </div>
    </div>
  )
}
