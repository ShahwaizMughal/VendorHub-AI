import { useParams } from "react-router-dom";
import { useAcceptQuoteMutation, useGetQuotesQuery } from "../services/rfqApi";
import ComparisonTable from "../components/rfq/ComparisonTable";
import { useState } from "react";

export default function QuoteComparison() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetQuotesQuery(id);
  const [acceptQuote] = useAcceptQuoteMutation();
  const [acceptingId, setAcceptingId] = useState(null);

  if (isLoading) return <div className="card">Loading quotes…</div>;
  if (error) return <div className="card error-box">Unable to load quotes.</div>;

  const result = data.data;
  const onAccept = async quoteId => {
    if (!window.confirm("Accept this quote and create the order? Other submitted quotes will be declined.")) return;
    setAcceptingId(quoteId);
    try { await acceptQuote(quoteId).unwrap(); } finally { setAcceptingId(null); }
  };

  return <section className="card"><div className="page-header"><div><p className="eyebrow">RFQ</p><h1>Quote comparison</h1></div><span className="status">{result.quotes.length} quotes</span></div><ComparisonTable quotes={result.quotes} recommendation={result.recommendation} onAccept={onAccept} acceptingId={acceptingId} /></section>;
}
