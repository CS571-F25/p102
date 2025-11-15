import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { bucketGet, bucketPut } from "../Bucket";

export default function EditEvent() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function load() {
      const ev = await bucketGet("events");
      if (ev && ev.results && ev.results[id]) {
        const e = ev.results[id];
        setTitle(e.title || "");
        setDate(e.date || "");
        setDescription(e.description || "");
        setLocation(e.location || "");
      }
      setLoaded(true);
    }
    load();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    const ev = await bucketGet("events");
    if (!ev || !ev.results || !ev.results[id]) {
      nav("/");
      return;
    }
    const original = ev.results[id];

    await bucketPut("events", id, {
      ...original,
      title,
      date: date || null,
      description,
      location
    });

    nav("/");
  }

  if (!loaded) {
    return (
      <div className="page-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="title-whimsy">
        <i className="bi bi-pencil-square"></i> Edit Event
      </h1>

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <input
          type="date"
          value={date || ""}
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
          Save Changes
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