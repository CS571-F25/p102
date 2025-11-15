import { useEffect, useState } from "react";
import { getAll, update } from "../Bucket";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    getAll().then(setEvents);
  }, []);

  function rsvp(ev) {
    const newEv = { ...ev.value, rsvps: [...ev.value.rsvps, "me"] };
    update(ev.key, newEv).then(() => {
      getAll().then(setEvents);
    });
  }

  function addComment(ev) {
    if (!comment.trim()) return;
    const newEv = { ...ev.value, comments: [...ev.value.comments, comment] };
    update(ev.key, newEv).then(() => {
      setComment("");
      getAll().then(setEvents);
    });
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Upcoming Events</h1>
      {events.map(ev => (
        <div key={ev.key} style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
          <h3>{ev.value.title}</h3>
          <p>Date: {ev.value.date}</p>
          <p>Audience: {ev.value.audience}</p>

          <button onClick={() => rsvp(ev)}>
            RSVP ({ev.value.rsvps.length})
          </button>

          <div style={{ marginTop: "0.5rem" }}>
            <input
              placeholder="Add comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button onClick={() => addComment(ev)}>Post</button>
          </div>

          <ul>
            {ev.value.comments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}