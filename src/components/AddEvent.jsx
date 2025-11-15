import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bucketPost } from "../Bucket";

export default function AddEvent() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    await bucketPost("events", {
      title,
      date,
      description
    });

    nav("/");  // return home after saving
  }

  return (
    <div className="page-container">
      <h1 className="title-whimsy"><i className="bi bi-pencil-square"></i> Add Event</h1>

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
          required
        />

        <textarea
          placeholder="Event description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="4"
        ></textarea>

        <button type="submit">Save Event</button>
      </form>

      <Link to="/">
        <button style={{ background:"#888", marginTop:"20px" }}>
          Back to Home
        </button>
      </Link>
    </div>
  );
}