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
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function isWithinNext10Days(dateStr) {
  if (!dateStr) return false;
  const d = localDate(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 10;
}

export default function EventCard({ event, isRSVP, onToggleRSVP, onDelete }) {
  const [weather, setWeather] = useState(null);

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
        if (!geo.results || geo.results.length === 0) return;
        const { latitude, longitude } = geo.results[0];

        const d = localDate(event.date);
        const iso = d.toISOString().slice(0, 10);

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max&timezone=auto&start_date=${iso}&end_date=${iso}`
        );
        const w = await weatherRes.json();
        if (!w.daily || !w.daily.weathercode || w.daily.weathercode.length === 0) return;

        const code = w.daily.weathercode[0];
        const temp = w.daily.temperature_2m_max[0];
        let desc = "Unknown";

        if (code === 0) desc = "Clear sky";
        else if ([1, 2, 3].includes(code)) desc = "Partly cloudy";
        else if ([45, 48].includes(code)) desc = "Foggy";
        else if ([51, 53, 55, 56, 57].includes(code)) desc = "Drizzle";
        else if ([61, 63, 65, 80, 81, 82].includes(code)) desc = "Rain";
        else if ([66, 67].includes(code)) desc = "Freezing rain";
        else if ([71, 73, 75, 77, 85, 86].includes(code)) desc = "Snow";
        else if ([95, 96, 99].includes(code)) desc = "Thunderstorm";

        setWeather({ desc, temp });
      } catch (e) {
        setWeather(null);
      }
    }

    loadWeather();
  }, [event.location, event.date]);

  const dayText = getDayOfWeek(event.date);

  return (
    <div className="event-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3>{event.title}</h3>
          {dayText && <p>{dayText}</p>}
          {event.date && !dayText && <p>{event.date}</p>}
          {event.location && <p>Location: {event.location}</p>}
          {event.description && <p>{event.description}</p>}
          {weather && (
            <p>
              Forecast: {weather.desc}, {Math.round(weather.temp)}°C
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
          <button
            onClick={onToggleRSVP}
            style={{ background: isRSVP ? "#888" : "#2f71e8", minWidth: "110px" }}
          >
            {isRSVP ? "Undo RSVP" : "RSVP"}
          </button>

          <Link to={`/EditEvent/${event.id}`}>
            <button style={{ background: "#4b89ff", padding: "8px 10px" }}>
              <i className="bi bi-pencil-square"></i>
            </button>
          </Link>

          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                background: "#888",
                padding: "8px 10px"
              }}
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}