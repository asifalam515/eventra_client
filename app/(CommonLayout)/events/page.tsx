import { EventsBrowser } from "./events-browser"

interface Event {
  id: string
  name?: string
  title?: string
  description?: string
  date?: string
  location?: string
  venue?: string
  eventStatus?: "upcoming" | "ongoing" | "completed" | string
  status?: "upcoming" | "ongoing" | "completed" | string
  fee?: string | number
  review?: number
  type?: string
  attendees?: number
}

const page = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawSearch = resolvedSearchParams?.search
  const initialSearchTerm = Array.isArray(rawSearch)
    ? rawSearch[0] || ""
    : (rawSearch ?? "")

  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
    cache: "no-store",
  })
  const events = await data.json()
  const eventList = (events?.data ?? []).map((event: Event) => ({
    id: event.id,
    name: event.name || event.title,
    description: event.description,
    date: event.date,
    venue: event.venue || event.location,
    eventStatus: event.eventStatus || event.status,
    fee: event.fee,
    review: event.review,
    type: event.type,
    attendees: event.attendees,
  }))

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Explore Events
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover and explore upcoming events
        </p>
      </div>

      <EventsBrowser events={eventList} initialSearchTerm={initialSearchTerm} />
    </div>
  )
}

export default page
