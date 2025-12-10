import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketDelete } from "../Bucket";
import EventCard from "./EventCard";

function localDate(d) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day));
}

// NEW: expiration helper (Option A)
function isExpired(ev) {
  if (!ev.date) return false;
  const d = localDate(ev.date);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  d.setHours(0, 0, 0, 0);
  return d < today;
}

export default function MyRSVPs() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [groups, setGroups] = useState([]);
  const [usernames, setUsernames] = useState({});

  const userId = CS571.getBadgerId();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const ev = await bucketGet("events");
    const rv = await bucketGet("rsvps");
    const gr = await bucketGet("groups");
    const un = await bucketGet("usernames");

    // Load events
    if (ev && ev.results) {
      const arr = Object.keys(ev.results).map(id => ({
        id,
        ...ev.results[id]
      }));
      setEvents(arr);
    } else {
      setEvents([]);
    }

    // Load RSVPs
    if (rv && rv.results) {
      setRsvps(rv.results);
    } else {
      setRsvps({});
    }

    // Load groups
    if (gr && gr.results) {
      const arr = Object.keys(gr.results).map(id => ({
        id,
        ...gr.results[id]
      }));
      setGroups(arr);
    } else {
      setGroups([]);
    }

    // Load usernames
    if (un && un.results) {
      const map = {};
      Object.keys(un.results).forEach(id => {
        map[id] = un.results[id].username;
      });
      setUsernames(map);
    } else {
      setUsernames({});
    }
  }

  // Returns all events that *this user* has RSVP’d to
  function myRsvpEvents() {
    const myEventIds = Object.values(rsvps).map(r => r.eventId);
    return events.filter(ev => myEventIds.includes(ev.id));
  }

  // Un-RSVP from an event
  async function toggleRSVP(eventId) {
    const existing = Object.entries(rsvps).find(
      ([, item]) => item.eventId === eventId
    );

    if (!existing) return;

    const [rsvpId] = existing;
    await bucketDelete("rsvps", rsvpId);

    const newR = { ...rsvps };
    delete newR[rsvpId];
    setRsvps(newR);
  }

  // Delete event entirely (only if you are the owner)
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

  // Build map of groups for quick lookup
  const groupMap = {};
  groups.forEach(g => {
    groupMap[g.id] = g;
  });

  // FILTER: Only UPCOMING RSVP EVENTS (expired go to Memories)
  const rsvpEvents = myRsvpEvents()
    .filter(ev => !isExpired(ev)) // <-- key change
    .sort((a, b) => {
      const ad = a.date ? localDate(a.date).getTime() : Infinity;
      const bd = b.date ? localDate(b.date).getTime() : Infinity;
      return ad - bd;
    });

  return (
    <div className="page-container">

      <h1 className="title-whimsy">
        <i className="bi bi-card-checklist" aria-hidden="true"></i> My RSVPs
      </h1>

      {/* Back button */}
      <Link to="/">
        <button style={{ background: "#888", marginBottom: "20px" }}>
          Back to Home
        </button>
      </Link>

      <h2 style={{ textAlign: "left", marginBottom: "16px" }}>
        Upcoming Events You've RSVP’d To
      </h2>

      {rsvpEvents.length === 0 && (
        <p>You have no upcoming RSVP’d events.</p>
      )}

      {/* LIST OF ACTIVE RSVPs */}
      {rsvpEvents.map(ev => (
        <EventCard
          key={ev.id}
          event={ev}
          isRSVP={true}
          onToggleRSVP={() => toggleRSVP(ev.id)}
          onDelete={ev.ownerId === userId ? () => handleDelete(ev) : undefined}
          groupName={
            ev.groupId && groupMap[ev.groupId]
              ? groupMap[ev.groupId].name
              : ""
          }
          ownerName={
            ev.ownerId && usernames[ev.ownerId]
              ? usernames[ev.ownerId]
              : "Unknown user"
          }
        />
      ))}
    </div>
  );
}