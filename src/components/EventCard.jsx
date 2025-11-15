export default function EventCard({ id, item, onDelete }) {
  return (
    <div className="card my-2 p-3">
      <h3>{item.title}</h3>
      <p>Date: {item.date}</p>

      <button className="btn btn-danger mt-2" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
