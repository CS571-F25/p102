import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function localDate(d) {
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day));
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return "";
  const d = localDate(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function isWithinNext10Days(dateStr) {
  if (!dateStr) return false;
  const d = localDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (d - today) / 86400000;
  return diffDays >= 0 && diffDays <= 10;
}

export default function EventCard({
  event,
  isRSVP,
  onToggleRSVP,
  onDelete,
  groupName,
  // new props for Memories page
  showRSVP = true,
  showEdit = true,
  showDelete = true,
  deleteAriaLabel = "Delete this event"
}) {
  const [weather, setWeather] = useState(null);
  const myBid = CS571.getBadgerId();
  const isMine = event.ownerId === myBid;

  useEffect(() => {
    async function loadWeather() {
      if (!event.location || !event.date) return;
      if (!isWithinNext10Days(event.date)) return;

      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            event.location
          )}&count=1`
        );
        const geo = await geoRes.json();
        if (!geo.results?.length) return;

        const iso = localDate(event.date).toISOString().slice(0, 10);

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${
            geo.results[0].latitude
          }&longitude=${
            geo.results[0].longitude
          }&daily=weathercode,temperature_2m_max&timezone=auto&start_date=${iso}&end_date=${iso}`
        );
        const w = await weatherRes.json();

        const code = w.daily.weathercode[0];
        const temp = w.daily.temperature_2m_max[0];

        let desc = "Unknown";
        if (code === 0) desc = "Clear sky";
        else if ([1, 2, 3].includes(code)) desc = "Partly cloudy";
        else if ([61, 63, 65, 80, 81, 82].includes(code)) desc = "Rain";

        setWeather({ desc, temp });
      } catch {
        // If weather fails, just ignore.
      }
    }

    loadWeather();
  }, [event.location, event.date]);

  const dayText = getDayOfWeek(event.date);

  return (
    <article
      className="event-card"
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: "14px",
        borderRadius: "14px",
        paddingBottom: "16px"
      }}
      aria-label={`Event card for ${event.title}`}
    >
      {/* LEFT SIDE INFO */}
      <div style={{ flex: 1 }}>
        <h2 style={{ marginTop: 0 }}>{event.title}</h2>

        {dayText && (
          <p style={{ margin: "4px 0" }}>
            <i className="bi bi-calendar-event" aria-hidden="true"></i>{" "}
            <strong>Date:</strong> {dayText}
          </p>
        )}

        {event.location && (
          <p style={{ margin: "4px 0" }}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i>{" "}
            <strong>Location:</strong> {event.location}
          </p>
        )}

        <hr className="event-divider" />

        {event.description && (
          <p style={{ margin: "4px 0" }}>
            <i className="bi bi-chat-left-text" aria-hidden="true"></i>{" "}
            <strong>Description:</strong> {event.description}
          </p>
        )}

        {Array.isArray(event.tags) && event.tags.length > 0 && (
          <p style={{ margin: "6px 0" }}>
            <strong>
              <i className="bi bi-tags" aria-hidden="true"></i> Tags:
            </strong>
            <br />
            {event.tags.map(tag => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </p>
        )}

        {groupName && (
          <p style={{ margin: "4px 0" }}>
            <i className="bi bi-people-fill" aria-hidden="true"></i>{" "}
            <strong>Group:</strong> {groupName}
          </p>
        )}

        <p style={{ margin: "4px 0" }}>
          <i className="bi bi-person-circle" aria-hidden="true"></i>{" "}
          <strong>Posted by:</strong> {isMine ? "You" : "Another User"}
        </p>

        {weather && (
          <p style={{ margin: "4px 0" }}>
            <i className="bi bi-cloud-sun" aria-hidden="true"></i>{" "}
            <strong>Weather:</strong> {weather.desc},{" "}
            {Math.round(weather.temp)}°C
          </p>
        )}
      </div>

      {/* RIGHT SIDE BUTTON COLUMN (smaller) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: "70px",
          alignItems: "stretch"
        }}
      >
        {showRSVP && onToggleRSVP && (
          <button
            onClick={onToggleRSVP}
            aria-label={isRSVP ? "Cancel RSVP" : "RSVP to this event"}
            style={{
              background: isRSVP ? "#888" : "#2f71e8",
              width: "100%",
              padding: "6px 8px",
              fontSize: "13px"
            }}
          >
            {isRSVP ? "Undo" : "RSVP"}
          </button>
        )}

        {showEdit && (
          <Link to={`/EditEvent/${event.id}`}>
            <button
              aria-label="Edit this event"
              style={{
                background: "#4b89ff",
                width: "100%",
                padding: "6px 8px"
              }}
            >
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </button>
          </Link>
        )}

        {showDelete && onDelete && (
          <button
            aria-label={deleteAriaLabel}
            onClick={onDelete}
            style={{
              background: "#888",
              width: "100%",
              padding: "6px 8px"
            }}
          >
            <i className="bi bi-trash" aria-hidden="true"></i>
          </button>
        )}
      </div>
    </article>
  );
}