import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketPost, bucketDelete } from "../Bucket";
import EventCard from "./EventCard";

function localDate(d) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day));
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [sortType, setSortType] = useState("soonest");

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
      return;
    }

    const res = await bucketPost("rsvps", { eventId });
    setRsvps({
      ...rsvps,
      [res.id]: { eventId }
    });
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

  function getSortedEvents() {
    const arr = [...events];
    if (sortType === "soonest") {
      arr.sort((a, b) => {
        const ad = a.date ? localDate(a.date).getTime() : Infinity;
        const bd = b.date ? localDate(b.date).getTime() : Infinity;
        return ad - bd;
      });
    } else if (sortType === "recent") {
      arr.sort((a, b) => {
        const at = a.createdAt || 0;
        const bt = b.createdAt || 0;
        return bt - at;
      });
    }
    return arr;
  }

  const sortedEvents = getSortedEvents();
  const userId = CS571.getBadgerId();

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="title-whimsy">
          <i className="bi bi-bucket"></i> Social Bucket List
        </h1>
        <div>
          <span style={{ marginRight: "8px" }}>
            <i className="bi bi-sort-down"></i>
          </span>
          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            style={{ padding: "6px", borderRadius: "8px", border: "1px solid #bcd0e6" }}
          >
            <option value="soonest">Soonest Time</option>
            <option value="recent">Most Recently Added</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "25px" }}>
        <Link to="/Groups">
          <button style={{ marginRight: "22px" }}>
            <i className="bi bi-people-fill"></i> Groups
          </button>
        </Link>

        <Link to="/AddEvent">
          <button>
            <i className="bi bi-pencil-square"></i> Add Event
          </button>
        </Link>

        &nbsp;&nbsp;

        <Link to="/MyRSVPs">
          <button style={{ background: "#4b89ff" }}>
            <i className="bi bi-card-checklist"></i> My RSVPs
          </button>
        </Link>
      </div>

      {sortedEvents.length === 0 && <p>No events yet. Add one!</p>}

      {sortedEvents.map(ev => (
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