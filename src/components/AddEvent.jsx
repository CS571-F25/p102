import { useState } from "react";
import { add } from "../Bucket";


export default function AboutMe() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [audience, setAudience] = useState("friends");

  function create() {
    if (!title.trim() || !date.trim()) return;
    add({
      title,
      date,
      audience,
      rsvps: [],
      comments: []
    }).then(() => {
      setTitle("");
      setDate("");
    });
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Add Event</h1>

      <input
        placeholder="Event title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ marginLeft: "1rem" }}
      />

      <select
        value={audience}
        onChange={e => setAudience(e.target.value)}
        style={{ marginLeft: "1rem" }}
      >
        <option value="friends">Friends</option>
        <option value="group">Group</option>
      </select>

      <button onClick={create} style={{ marginLeft: "1rem" }}>
        Add Event
      </button>
    </div>
  );
}