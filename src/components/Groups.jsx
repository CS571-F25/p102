import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bucketGet, bucketPost, bucketPut } from "../Bucket";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addInputs, setAddInputs] = useState({});

  const me = CS571.getBadgerId();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const res = await bucketGet("groups");
    if (res && res.results) {
      const arr = Object.keys(res.results).map(id => ({
        id,
        ...res.results[id]
      }));
      setGroups(arr);
    } else {
      setGroups([]);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;

    await bucketPost("groups", {
      name: name.trim(),
      ownerId: me,
      members: [me]
    });

    setName("");
    setCreating(false);
    await loadGroups();
  }

  async function handleLeave(group) {
    const members = Array.isArray(group.members) ? group.members : [];
    const newMembers = members.filter(m => m !== me);

    await bucketPut("groups", group.id, {
      ...group,
      members: newMembers
    });

    await loadGroups();
  }

  async function handleAddMember(group) {
    const input = addInputs[group.id];
    if (!input || !input.trim()) return;

    const newMember = input.trim();
    const members = Array.isArray(group.members) ? group.members : [];

    if (!members.includes(newMember)) {
      await bucketPut("groups", group.id, {
        ...group,
        members: [...members, newMember]
      });
    }

    setAddInputs(prev => ({ ...prev, [group.id]: "" }));
    await loadGroups();
  }

  const myGroups = groups.filter(
    g => Array.isArray(g.members) && g.members.includes(me)
  );

  return (
    <div className="page-container">
      <h1 className="title-whimsy">
        <i className="bi bi-people-fill" aria-hidden="true"></i> Groups
      </h1>

      <Link to="/">
        <button 
          style={{ background: "#888", marginBottom: "20px" }}
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </Link>

      {/* CREATE GROUP BUTTON */}
      {!creating && (
        <button
          type="button"
          onClick={() => setCreating(true)}
          style={{ marginBottom: "20px" }}
          aria-label="Create a new group"
        >
          <i className="bi bi-plus-circle" aria-hidden="true"></i> Create Group
        </button>
      )}

      {/* CREATE GROUP FORM */}
      {creating && (
        <form 
          onSubmit={handleCreate}
          aria-label="Create group form"
          style={{ marginBottom: "24px", textAlign: "left" }}
        >
          <label htmlFor="groupName"><strong>Group Name</strong></label>
          <input
            id="groupName"
            type="text"
            placeholder="Enter group name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div style={{ marginTop: "8px" }}>
            <button type="submit" aria-label="Save new group">Save Group</button>
            <button
              type="button"
              aria-label="Cancel group creation"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              style={{ background: "#888", marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* MY GROUPS LIST */}
      {myGroups.length === 0 && (
        <p>You are currently not a member of any groups.</p>
      )}

      <section aria-label="Your groups list">
        {myGroups.map(g => (
          <article 
            key={g.id} 
            className="event-card"
            aria-label={`Group card for ${g.name}`}
          >
            <h2 style={{ marginTop: 0 }}>{g.name}</h2>

            {/* Member Count */}
            <p>
              <strong>Members:</strong>{" "}
              {Array.isArray(g.members) ? g.members.length : 0}
            </p>

            {/* ADD MEMBER INPUT */}
            <label htmlFor={`addMember-${g.id}`} style={{ fontWeight: "bold" }}>
              Add Member by ID
            </label>
            <div 
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                alignItems: "center"
              }}
            >
              <input
                id={`addMember-${g.id}`}
                type="text"
                placeholder="Enter user ID"
                value={addInputs[g.id] || ""}
                onChange={e =>
                  setAddInputs(prev => ({ ...prev, [g.id]: e.target.value }))
                }
                aria-label={`Add member to group ${g.name}`}
                style={{ flexGrow: 1 }}
              />
              <button
                type="button"
                onClick={() => handleAddMember(g)}
                aria-label={`Confirm add member to ${g.name}`}
              >
                Add
              </button>
            </div>

            {/* LEAVE GROUP BUTTON */}
            <button
              type="button"
              onClick={() => handleLeave(g)}
              style={{ background: "#888", marginTop: "10px" }}
              aria-label={`Leave group ${g.name}`}
            >
              Leave Group
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}