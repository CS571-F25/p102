import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketDelete } from "../Bucket";
import EventCard from "./EventCard";
import { fetchAllMemories, addEventMemory } from "./MemoryService";

function localDate(d) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day));
}

function isExpired(ev) {
  if (!ev.date) return false;
  const d = localDate(ev.date);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export default function Memories() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [groups, setGroups] = useState([]);
  const [usernames, setUsernames] = useState({});

  // NEW: memory image store
  const [memoryImages, setMemoryImages] = useState({});
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState("");

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  const userId = CS571.getBadgerId();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const ev = await bucketGet("events");
    const rv = await bucketGet("rsvps");
    const gr = await bucketGet("groups");
    const un = await bucketGet("usernames");

    if (ev && ev.results) {
      const arr = Object.keys(ev.results).map(id => ({
        id,
        ...ev.results[id]
      }));
      setEvents(arr);
    }

    if (rv && rv.results) {
      setRsvps(rv.results);
    } else setRsvps({});

    if (gr && gr.results) {
      const arr = Object.keys(gr.results).map(id => ({
        id,
        ...gr.results[id]
      }));
      setGroups(arr);
    }

    if (un && un.results) {
      const map = {};
      Object.keys(un.results).forEach(id => {
        map[id] = un.results[id].username;
      });
      setUsernames(map);
    }

    await loadMemoriesForExpiredEvents(ev, rv);
  }

  function getMyExpiredEvents(eventsObj, rsvpsObj) {
    if (!eventsObj?.results || !rsvpsObj?.results) return [];
    const all = Object.keys(eventsObj.results).map(id => ({
      id,
      ...eventsObj.results[id]
    }));
    const myIds = Object.values(rsvpsObj.results).map(r => r.eventId);
    return all.filter(ev => myIds.includes(ev.id) && isExpired(ev));
  }

  async function loadMemoriesForExpiredEvents(ev, rv) {
    const expired = getMyExpiredEvents(ev, rv);
    const allMem = await fetchAllMemories();

    const mapping = {};
    expired.forEach(e => {
      const rec = allMem[e.id];
      mapping[e.id] = rec?.images || [];
    });

    setMemoryImages(mapping);
  }

  function myExpiredEvents() {
    const ids = Object.values(rsvps).map(r => r.eventId);
    return events.filter(ev => ids.includes(ev.id) && isExpired(ev));
  }

  async function deleteMemory(eventId) {
    const existing = Object.entries(rsvps).find(
      ([_, item]) => item.eventId === eventId
    );
    if (!existing) return;

    const [rsvpId] = existing;
    await bucketDelete("rsvps", rsvpId);

    const newSet = { ...rsvps };
    delete newSet[rsvpId];
    setRsvps(newSet);

    setMemoryImages(prev => {
      const c = { ...prev };
      delete c[eventId];
      return c;
    });
  }

  async function handleImageUpload(eventId, file) {
    setError("");

    if (!file?.type?.startsWith("image/")) {
      setError("Please upload an image file only.");
      return;
    }

    setUploading(prev => ({ ...prev, [eventId]: true }));

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      const updated = await addEventMemory(eventId, userId, base64);

      setMemoryImages(prev => ({
        ...prev,
        [eventId]: updated
      }));

      setUploading(prev => ({ ...prev, [eventId]: false }));
    };

    reader.readAsDataURL(file);
  }

  const groupMap = {};
  groups.forEach(g => (groupMap[g.id] = g));

  const memories = myExpiredEvents().sort((a, b) => {
    const ad = a.date ? localDate(a.date).getTime() : 0;
    const bd = b.date ? localDate(b.date).getTime() : 0;
    return bd - ad;
  });

  return (
    <div className="page-container">
      <h1 className="title-whimsy">
        <i className="bi bi-hourglass-split"></i> Memories
      </h1>

      <Link to="/">
        <button style={{ background: "#888", marginBottom: 20 }}>
          Back to Home
        </button>
      </Link>

      <h2 style={{ textAlign: "left" }}>Past Events You&apos;ve Attended</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {memories.map(ev => (
        <div key={ev.id} style={{ marginBottom: 30 }}>
          <EventCard
            event={ev}
            isRSVP={false}
            showRSVP={false}
            showEdit={false}
            showDelete={true}
            onDelete={() => deleteMemory(ev.id)}
          />

          <h3 style={{ marginTop: 10 }}>Photos</h3>

          {uploading[ev.id] && (
            <p>
              <i className="bi bi-arrow-repeat spin"></i> Uploading...
            </p>
          )}

          {memoryImages[ev.id]?.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "8px"
              }}
            >
              {memoryImages[ev.id].map((img, i) => (
                <img
                  key={i}
                  src={img.data}
                  alt="Memory"
                  style={{
                    flex: "1 1 calc(33.333% - 10px)",
                    maxWidth: "calc(33.333% - 10px)",
                    minWidth: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() => setLightboxImage(img.data)}
                />
              ))}
            </div>
          ) : (
            <p>No photos yet.</p>
          )}

          <label className="upload-btn">
            <i className="bi bi-image"></i> Add Photo
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e =>
                handleImageUpload(ev.id, e.target.files?.[0] || null)
              }
            />
          </label>
        </div>
      ))}

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} className="lightbox-image" alt="Preview" />
        </div>
      )}
    </div>
  );
}
