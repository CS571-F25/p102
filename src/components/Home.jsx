import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketPost, bucketDelete } from "../Bucket";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({}); // store RSVP statuses

  // Load events + RSVPs
  useEffect(() => {
    async function loadData() {
      const ev = await bucketGet("events");
      const rv = await bucketGet("rsvps");

      if (ev?.results) {
        const arr = Object.keys(ev.results).map(id => ({
          id,
          ...ev.results[id]
        }));
        setEvents(arr);
      }

      if (rv?.results) {
        setRsvps(rv.results); // object of { rsvpId: { eventId } }
      }
    }

    loadData();
  }, []);

  // find if event is RSVP'd
  function isRSVP(eventId) {
    return Object.values(rsvps).some(r => r.eventId === eventId);
  }

  // toggle RSVP
  async function toggleRSVP(eventId) {
    // already RSVP'd → remove it
    const existing = Object.entries(rsvps).find(
      ([id, item]) => item.eventId === eventId
    );

    if (existing) {
      const [rsvpId] = existing;
      await bucketDelete("rsvps", rsvpId);

      // remove from local state
      const newRsvps = { ...rsvps };
      delete newRsvps[rsvpId];
      setRsvps(newRsvps);
      return;
    }

    // not RSVPd → add it
    const res = await bucketPost("rsvps", { eventId });

    setRsvps({
      ...rsvps,
      [res.id]: { eventId }
    });
  }

  return (
    <div className="page-container">
      <h1 className="title-whimsy"><i className="bi bi-bucket"></i> Social Bucket List</h1>

      <div style={{ marginBottom: "25px" }}>
        <Link to="/AddEvent"><button>Add Event</button></Link>
        &nbsp;&nbsp;
        <Link to="/MyRSVPs"><button style={{ background:"#4b89ff" }}>My RSVPs</button></Link>
      </div>

      {events.length === 0 && <p>No events yet.</p>}

      {events.map(ev => (
        <div key={ev.id} className="event-card">
          <h3>{ev.title}</h3>
          <p><strong>Date:</strong> {ev.date}</p>
          <p>{ev.description}</p>

          <button
            onClick={() => toggleRSVP(ev.id)}
            style={{
              background: isRSVP(ev.id) ? "#888" : "#2f71e8"
            }}
          >
            {isRSVP(ev.id) ? "Undo RSVP" : "RSVP"}
          </button>
        </div>
      ))}
    </div>
  );
}