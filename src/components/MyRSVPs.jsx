import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketDelete } from "../Bucket";
import EventCard from "./EventCard";

export default function MyRSVPs() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const ev = await bucketGet("events");
    const rv = await bucketGet("rsvps");

    if (ev && ev.results) {
      const arr = Object.keys(ev.results).map(id => ({
        id,
        ...ev.results[id]
      }));
      setEvents(arr);
    } else {
      setEvents([]);
    }

    if (rv && rv.results) {
      setRsvps(rv.results);
    } else {
      setRsvps({});
    }
  }

  function isRSVP(eventId) {
    return Object.values(rsvps).some(r => r.eventId === eventId);
  }

  async function toggleRSVP(eventId) {
    const existing = Object.entries(rsvps).find(
      ([, item]) => item.eventId === eventId
    );

    if (existing) {
      const [rsvpId] = existing;
      await bucketDelete("rsvps", rsvpId);
      const newRsvps = { ...rsvps };
      delete newRsvps[rsvpId];
      setRsvps(newRsvps);
    }
  }

  async function handleDelete(ev) {
    await bucketDelete("events", ev.id);
    const related = Object.entries(rsvps).filter(
      ([, item]) => item.eventId === ev.id
    );
    for (const [rid] of related) {
      await bucketDelete("rsvps", rid);
    }
    await loadData();
  }

  const rsvpEventIds = new Set(
    Object.values(rsvps).map(r => r.eventId)
  );
  const myEvents = events.filter(e => rsvpEventIds.has(e.id));
  const userId = CS571.getBadgerId();

  return (
    <div className="page-container">
      <h1 className="title-whimsy">
        <i className="bi bi-card-checklist"></i> My RSVPs
      </h1>

      <Link to="/">
        <button style={{ background: "#888", marginBottom: "20px" }}>
          Back to Home
        </button>
      </Link>

      {myEvents.length === 0 && <p>You haven’t RSVP’d to anything yet.</p>}

      {myEvents.map(ev => (
        <EventCard
          key={ev.id}
          event={ev}
          isRSVP={isRSVP(ev.id)}
          onToggleRSVP={() => toggleRSVP(ev.id)}
          onDelete={ev.ownerId === userId ? () => handleDelete(ev) : undefined}
        />
      ))}
    </div>
  );
}