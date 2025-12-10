import { useEffect, useState } from "react";
import { bucketGet, bucketPost } from "../Bucket";
import { useNavigate } from "react-router-dom";
import EventPreview from "./EventPreview"; // ⬅ NEW

export default function AddEvent() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const TAG_OPTIONS = ["Food", "Sports", "Night Out", "Outdoors", "Study", "Other"];
  const myId = CS571.getBadgerId();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const gr = await bucketGet("groups");
    if (gr && gr.results) {
      const arr = Object.keys(gr.results).map(id => ({
        id,
        ...gr.results[id]
      }));
      const mine = arr.filter(
        g => Array.isArray(g.members) && g.members.includes(myId)
      );
      setGroups(mine);
    }
  }

  function toggleTag(tag) {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Event must have a title!");
      return;
    }

    await bucketPost("events", {
      title: title.trim(),
      description: desc.trim(),
      location: location.trim(),
      date,
      tags,
      createdAt: Date.now(),
      ownerId: myId,
      groupId: selectedGroup || ""
    });

    navigate("/");
  }

  const groupName = groups.find(g => g.id === selectedGroup)?.name;

  return (
    <div className="page-container">
      <h1 className="title-whimsy">Add an Event</h1>

      <form onSubmit={handleSubmit} aria-label="Add event form">
        
        <div style={{ textAlign: "left" }}>
          <label htmlFor="eventTitle">Event Title</label>
          <input
            id="eventTitle"
            type="text"
            placeholder="Event title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <label htmlFor="eventDescription">Description</label>
          <textarea
            id="eventDescription"
            placeholder="Describe your event"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />

          <label htmlFor="eventLocation">Location</label>
          <input
            id="eventLocation"
            type="text"
            placeholder="Where?"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <label htmlFor="eventDate">Date</label>
          <input
            id="eventDate"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* TAG SECTION */}
        <section aria-label="Tag selection">
          <h2 style={{ textAlign: "left", marginTop: "20px" }}>Tags</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px"
            }}
          >
            {TAG_OPTIONS.map(tag => (
              <button
                type="button"
                key={tag}
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: "1px solid #bcd0e6",
                  background: tags.includes(tag) ? "#2f71e8" : "#ffffff",
                  color: tags.includes(tag) ? "white" : "#333"
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* GROUP SECTION */}
        <section aria-label="Group selection">
          <h2 style={{ textAlign: "left", marginTop: "20px" }}>Assign to Group (optional)</h2>
          
          <label htmlFor="groupSelect" className="visually-hidden">
            Choose a group
          </label>

          <select
            id="groupSelect"
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ width: "100%", marginTop: "10px", padding: "10px" }}
          >
            <option value="">No group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </section>

        {/* SUBMIT BUTTON */}
        <button type="submit" aria-label="Create event">
          Create Event
        </button>
      </form>

      {/* LIVE EVENT PREVIEW */}
      <EventPreview
        title={title}
        desc={desc}
        location={location}
        date={date}
        tags={tags}
        groupName={groupName}
      />
    </div>
  );
}