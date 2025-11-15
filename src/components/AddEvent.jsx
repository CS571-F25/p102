import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bucketPost } from "../Bucket";

export default function AddEvent() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ownerId = CS571.getBadgerId();

    await bucketPost("events", {
      title,
      date: date || null,
      description,
      location,
      ownerId,
      createdAt: Date.now()
    });

    nav("/");
  }

  return (
    <div className="page-container">
      <h1 className="title-whimsy">
        <i className="bi bi-pencil-square"></i> Add Event
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location (optional)"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        <textarea
          placeholder="Event description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="4"
        />

        <button type="submit">
          Save Event
        </button>
      </form>

      <Link to="/">
        <button style={{ background: "#888", marginTop: "20px" }}>
          Back to Home
        </button>
      </Link>
    </div>
  );
}