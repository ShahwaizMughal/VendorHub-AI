import { useState } from "react";

const initial = {
  rfqId: "",
  unitPrice: "",
  totalPrice: "",
  currency: "USD",
  leadTimeDays: "",
  paymentTerms: "",
  shippingMethod: "",
  notes: "",
};

export default function QuoteForm({ rfqId, onSubmit, loading = false }) {
  const [form, setForm] = useState({ ...initial, rfqId });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      unitPrice: Number(form.unitPrice),
      totalPrice: Number(form.totalPrice),
      leadTimeDays: Number(form.leadTimeDays),
      currency: form.currency.trim().toUpperCase(),
    });
  }

  return (
    <form onSubmit={submit} className="rfq-form">
      <h2>Submit / Revise Quote</h2>
      <label>Unit price<input required min="0" step="0.01" type="number" value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} /></label>
      <label>Total price<input required min="0" step="0.01" type="number" value={form.totalPrice} onChange={(e) => update("totalPrice", e.target.value)} /></label>
      <div className="grid">
        <label>Currency<input required maxLength="3" value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} /></label>
        <label>Lead time (days)<input required min="0" type="number" value={form.leadTimeDays} onChange={(e) => update("leadTimeDays", e.target.value)} /></label>
      </div>
      <label>Payment terms<input value={form.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} /></label>
      <label>Shipping method<input value={form.shippingMethod} onChange={(e) => update("shippingMethod", e.target.value)} /></label>
      <label>Notes<textarea maxLength="5000" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
      <button disabled={loading} type="submit">{loading ? "Submitting..." : "Submit Quote"}</button>
    </form>
  );
}
