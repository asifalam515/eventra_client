import { EventCard } from "@/components/ui/event-card"

interface Event {
  id: string
  name: string
  description: string
  date?: string
  location?: string
  attendees?: number
}

const page = async () => {
  const data = await fetch("http://localhost:5000/api/v1/events")
  const events = await data.json()

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.data.map((event: Event) => (
          <EventCard
            key={event.id}
            event={{
              id: event.id,
              name: event.name,
              description: event.description,
              date: event.date,
              venue: event.venue || event.location,
              eventStatus: event.eventStatus,
              fee: event.fee,
              review: event.review,
              type: event.type,
              attendees: event.attendees,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default page
