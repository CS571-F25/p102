import { useEffect, useState } from "react";
import { bucketGet, bucketPut } from "../Bucket";
import { useParams, useNavigate } from "react-router-dom";
import EventPreview from "./EventPreview";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const myId = CS571.getBadgerId();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const TAG_OPTIONS = ["Food", "Sports", "Night Out", "Outdoors", "Study", "Other"];

  useEffect(() => {
    loadEvent();
    loadGroups();
  }, []);

  async function loadEvent() {
    const res = await bucketGet("events", id);

    if (res) {
      setTitle(res.title || "");
      setDesc(res.description || "");
      setLocation(res.location || "");
      setDate(res.date || "");
      setTags(res.tags || []);
      setSelectedGroup(res.groupId || "");
    }
  }

  async function loadGroups() {
    const gr = await bucketGet("groups");
    if (gr && gr.results) {
      const arr = Object.keys(gr.results).map(gid => ({
        id: gid,
        ...gr.results[gid]
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

    await bucketPut("events", id, {
      title: title.trim(),
      description: desc.trim(),
      location: location.trim(),
      date,
      tags,
      ownerId: myId,
      groupId: selectedGroup || ""
    });

    navigate("/");
  }

  const currentGroupName = groups.find(g => g.id === selectedGroup)?.name;

  return (
    <div className="page-container">
      <h1 className="title-whimsy">Edit Event</h1>

      <form onSubmit={handleSubmit} aria-label="Edit event form">

        {/* TITLE */}
        <label htmlFor="editTitle">Event Title</label>
        <input
          id="editTitle"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* DESCRIPTION */}
        <label htmlFor="editDescription">Description</label>
        <textarea
          id="editDescription"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        {/* LOCATION */}
        <label htmlFor="editLocation">Location</label>
        <input
          id="editLocation"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        {/* DATE */}
        <label htmlFor="editDate">Date</label>
        <input
          id="editDate"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        {/* TAG SECTION */}
        <section aria-label="Tag selection">
          <h2 style={{ textAlign: "left", marginTop: "20px" }}>Tags</h2>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {TAG_OPTIONS.map(tag => (
              <button
                key={tag}
                type="button"
                aria-pressed={tags.includes(tag)}
                aria-label={`Tag option: ${tag}`}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: "1px solid #bcd0e6",
                  background: tags.includes(tag) ? "#2f71e8" : "#fff",
                  color: tags.includes(tag) ? "#fff" : "#333",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* GROUP SECTION */}
        <section aria-label="Group selection">
          <h2 style={{ textAlign: "left", marginTop: "20px" }}>Group</h2>

          <label htmlFor="editGroup" className="visually-hidden">
            Select group
          </label>

          <select
            id="editGroup"
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
          >
            <option value="">No group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </section>

        {/* SUBMIT */}
        <button type="submit" aria-label="Save event changes">
          Save Changes
        </button>
      </form>

      {/* EVENT PREVIEW COMPONENT */}
      <EventPreview
        title={title}
        desc={desc}
        location={location}
        date={date}
        tags={tags}
        groupName={currentGroupName}
      />
    </div>
  );
}