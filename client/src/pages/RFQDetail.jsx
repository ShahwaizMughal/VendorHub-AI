import { Link, useParams } from "react-router-dom";
import { useGetRfqQuery } from "../services/rfqApi";

export default function RFQDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetRfqQuery(id);

  if (isLoading) return <div className="card">Loading RFQ…</div>;
  if (error) return <div className="card error-box">Unable to load RFQ.</div>;

  const { rfq, quotes = [] } = data.data;
  return (
    <div className="stack">
      <section className="card">
        <div className="page-header"><div><p className="eyebrow">RFQ</p><h1>{rfq.productName}</h1></div><span className="status">{rfq.status}</span></div>
        <div className="details-grid">
          <div><span>Quantity</span><strong>{rfq.quantity}</strong></div>
          <div><span>Delivery</span><strong>{new Date(rfq.deliveryDate).toLocaleDateString()}</strong></div>
          <div><span>Budget</span><strong>{rfq.budget?.min ?? "—"} – {rfq.budget?.max ?? "—"} {rfq.budget?.currency || ""}</strong></div>
          <div><span>Vendors</span><strong>{rfq.vendorRecipients.length}</strong></div>
        </div>
        <p>{rfq.materialSpec || "No material specification provided."}</p>
        <div className="actions"><Link className="primary-button" to={`/rfqs/${id}/quotes`}>Compare quotes ({quotes.length})</Link><a className="secondary-button" href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/rfqs/${id}/pdf`} target="_blank" rel="noreferrer">Export PDF</a></div>
      </section>
    </div>
  );
}
