import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketPost, bucketDelete } from "../Bucket";
import EventCard from "./EventCard";
//updated docs 

function localDate(d) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day));
}

// NEW: expiration helper
function isExpired(ev) {
  if (!ev.date) return false;
  const d = localDate(ev.date);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d < today;
}

const TAG_OPTIONS = ["Food", "Sports", "Night Out", "Outdoors", "Study", "Other"];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [sortType, setSortType] = useState("soonest");
  const [groups, setGroups] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTags, setFilterTags] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [usernames, setUsernames] = useState({});

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
    } else {
      setEvents([]);
    }

    if (rv && rv.results) {
      setRsvps(rv.results);
    } else {
      setRsvps({});
    }

    if (gr && gr.results) {
      const arr = Object.keys(gr.results).map(id => ({
        id,
        ...gr.results[id]
      }));
      setGroups(arr);
    } else {
      setGroups([]);
    }

    if (un && un.results) {
      const map = {};
      Object.keys(un.results).forEach(id => {
        map[id] = un.results[id].username;
      });
      setUsernames(map);
    } else {
      setUsernames({});
    }
  }

  function isRSVP(eventId) {
    return Object.values(rsvps).some(r => r.eventId === eventId);
  }

  async function toggleRSVP(eventId) {
    const existing = Object.entries(rsvps).find(
      ([, item]) => item.eventId === eventId
    );

    if (existing) {
      const [rsvpId] = existing;
      await bucketDelete("rsvps", rsvpId);
      const newRsvps = { ...rsvps };
      delete newRsvps[rsvpId];
      setRsvps(newRsvps);
      return;
    }

    const res = await bucketPost("rsvps", { eventId });
    setRsvps({
      ...rsvps,
      [res.id]: { eventId }
    });
  }

  async function handleDelete(ev) {
    await bucketDelete("events", ev.id);
    const related = Object.entries(rsvps).filter(
      ([, item]) => item.eventId === ev.id
    );
    for (const [rid] of related) {
      await bucketDelete("rsvps", rid);
    }
    await loadData();
  }

  function toggleFilterTag(tag) {
    setFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function getVisibleEvents() {
    let arr = [...events];

    // NEW: hide expired events
    arr = arr.filter(ev => !isExpired(ev));

    if (filterTags.length > 0) {
      arr = arr.filter(ev =>
        Array.isArray(ev.tags) &&
        ev.tags.some(t => filterTags.includes(t))
      );
    }

    if (ownerFilter === "mine") {
      arr = arr.filter(ev => ev.ownerId === userId);
    } else if (ownerFilter === "others") {
      arr = arr.filter(ev => ev.ownerId && ev.ownerId !== userId);
    }

    if (groupFilter !== "all") {
      arr = arr.filter(ev => ev.groupId === groupFilter);
    }

    if (sortType === "soonest") {
      arr.sort((a, b) => {
        const ad = a.date ? localDate(a.date).getTime() : Infinity;
        const bd = b.date ? localDate(b.date).getTime() : Infinity;
        return ad - bd;
      });
    } else if (sortType === "recent") {
      arr.sort((a, b) => {
        const at = a.createdAt || 0;
        const bt = b.createdAt || 0;
        return bt - at;
      });
    }

    return arr;
  }

  const visibleEvents = getVisibleEvents();
  const groupMap = {};
  groups.forEach(g => {
    groupMap[g.id] = g;
  });

  return (
    <div className="page-container">
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <h1 className="title-whimsy">
          <i className="bi bi-bucket"></i> Social Bucket List
        </h1>
      </div>

      {/* FILTER DROPDOWN BUTTONS */}
      <div style={{ marginBottom: "25px" }}>
        <Link to="/Groups">
          <button style={{ marginRight: "22px" }}>
            <i className="bi bi-people-fill"></i> Groups
          </button>
        </Link>

        <Link to="/AddEvent">
          <button>
            <i className="bi bi-pencil-square"></i> Add Event
          </button>
        </Link>

        &nbsp;&nbsp;

        <Link to="/MyRSVPs">
          <button style={{ background: "#4b89ff" }}>
            <i className="bi bi-card-checklist"></i> My RSVPs
          </button>
        </Link>

        &nbsp;&nbsp;

        <Link to="/Memories">
          <button style={{ background: "#888" }}>
            <i className="bi bi-hourglass-split"></i> Memories
          </button>
        </Link>
      </div>

      {/* EVENTS SECTION */}
      {visibleEvents.length === 0 && <p>No events match your filters. Try adjusting them!</p>}

      {visibleEvents.map(ev => (
        <EventCard
          key={ev.id}
          event={ev}
          isRSVP={isRSVP(ev.id)}
          onToggleRSVP={() => toggleRSVP(ev.id)}
          onDelete={ev.ownerId === userId ? () => handleDelete(ev) : undefined}
          groupName={ev.groupId && groupMap[ev.groupId] ? groupMap[ev.groupId].name : ""}
          ownerName={ev.ownerId && usernames[ev.ownerId] ? usernames[ev.ownerId] : "Unknown user"}
        />
      ))}
    </div>
  );
}
