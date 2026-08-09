export default function ComparisonTable({ quotes = [], recommendation, onAccept, acceptingId }) {
  if (!quotes.length) return <div className="empty-state">No quotes have been submitted yet.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Vendor</th><th>Total</th><th>Unit</th><th>Lead time</th><th>Currency</th><th>Revision</th><th>Action</th></tr></thead>
        <tbody>
          {quotes.map(quote => (
            <tr key={quote._id} className={quote.recommended ? "recommended" : ""}>
              <td>{String(quote.vendorId)}</td>
              <td>{quote.totalPrice}</td>
              <td>{quote.unitPrice}</td>
              <td>{quote.leadTimeDays} days</td>
              <td>{quote.currency}</td>
              <td>v{quote.revision}</td>
              <td>
                <button className="small-button" disabled={acceptingId === quote._id} onClick={() => onAccept(quote._id)}>
                  {acceptingId === quote._id ? "Accepting…" : "Accept"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {recommendation && <div className="recommendation"><strong>AI / Best-value recommendation:</strong> {recommendation.rationale} Score: {recommendation.score}/100.</div>}
    </div>
  );
}
