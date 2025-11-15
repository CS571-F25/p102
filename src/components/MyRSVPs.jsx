import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet } from "../Bucket";

export default function MyRSVPs() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);

  useEffect(() => {
    async function loadData() {
      const ev = await bucketGet("events");
      const rv = await bucketGet("rsvps");

      if (rv?.results) {
        const rsvpIds = Object.values(rv.results).map(r => r.eventId);
        setRsvps(rsvpIds);
      }

      if (ev?.results) {
        const arr = Object.keys(ev.results).map(id => ({
          id,
          ...ev.results[id]
        }));
        setEvents(arr);
      }
    }
    loadData();
  }, []);

  const myEvents = events.filter(e => rsvps.includes(e.id));

  return (
    <div className="page-container">
      <h1 className="title-whimsy"><i className="bi bi-card-checklist"></i> My RSVPs</h1>

      <Link to="/">
        <button style={{ background:"#888", marginBottom:"20px" }}>
          Back to Home
        </button>
      </Link>

      {myEvents.length === 0 && <p>You haven’t RSVP’d to anything yet.</p>}

      {myEvents.map(ev => (
        <div key={ev.id} className="event-card">
          <h3>{ev.title}</h3>
          <p><strong>Date:</strong> {ev.date}</p>
          <p>{ev.description}</p>
        </div>
      ))}
    </div>
  );
}