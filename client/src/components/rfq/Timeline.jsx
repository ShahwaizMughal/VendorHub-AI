const labels = {
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Timeline({ history = [] }) {
  return (
    <ol className="timeline">
      {history.map((item, index) => (
        <li key={`${item.status}-${item.changedAt}-${index}`}>
          <div className="timeline-dot" />
          <div><strong>{labels[item.status] || item.status}</strong><span>{new Date(item.changedAt).toLocaleString()}</span>{item.note && <p>{item.note}</p>}</div>
        </li>
      ))}
    </ol>
  );
}
