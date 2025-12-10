export default function EventPreview({ title, desc, location, date, tags, groupName }) {
  return (
    <div 
      className="event-card"
      aria-label="Live event preview"
      style={{ marginTop: "30px", opacity: 0.93 }}
    >
      <h2 style={{ marginBottom: "10px" }}>Preview</h2>

      <p><strong>Title:</strong> {title || "(No title yet)"}</p>
      <p><strong>Description:</strong> {desc || "(No description)"}</p>
      <p><strong>Location:</strong> {location || "(No location)"}</p>
      <p><strong>Date:</strong> {date || "(No date selected)"}</p>

      {tags?.length > 0 ? (
        <p><strong>Tags:</strong> {tags.join(", ")}</p>
      ) : (
        <p><strong>Tags:</strong> None</p>
      )}

      <p><strong>Group:</strong> {groupName || "No group"}</p>
    </div>
  );
}
