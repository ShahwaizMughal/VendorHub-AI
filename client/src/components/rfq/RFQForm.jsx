import { useState } from "react";
import AIDraftButton from "./AIDraftButton";

const initial = {
  productName: "",
  quantity: "",
  materialSpec: "",
  budget: { min: "", max: "", currency: "USD" },
  deliveryDate: "",
  paymentTerms: "",
  shippingMethod: "",
  vendorIds: "",
};

export default function RFQForm({ onSubmit, isLoading = false }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const setBudget = (key, value) => setForm(current => ({ ...current, budget: { ...current.budget, [key]: value } }));

  const applyDraft = draft => {
    setForm(current => ({ ...current, ...draft }));
  };

  const submit = async event => {
    event.preventDefault();
    setError("");

    const vendorIds = form.vendorIds.split(",").map(value => value.trim()).filter(Boolean);
    if (!form.productName.trim()) return setError("Product name is required.");
    if (!Number(form.quantity) || Number(form.quantity) <= 0) return setError("Quantity must be greater than 0.");
    if (!form.deliveryDate) return setError("Delivery date is required.");
    if (vendorIds.length < 1 || vendorIds.length > 10) return setError("Select between 1 and 10 vendors.");

    try {
      await onSubmit({
        productName: form.productName.trim(),
        quantity: Number(form.quantity),
        materialSpec: form.materialSpec.trim(),
        budget: {
          min: form.budget.min === "" ? undefined : Number(form.budget.min),
          max: form.budget.max === "" ? undefined : Number(form.budget.max),
          currency: form.budget.currency.trim().toUpperCase(),
        },
        deliveryDate: form.deliveryDate,
        paymentTerms: form.paymentTerms.trim(),
        shippingMethod: form.shippingMethod.trim(),
        vendorIds,
        attachments: [],
      });
    } catch (submitError) {
      setError(submitError?.data?.message || "Unable to create RFQ.");
    }
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <div className="form-header">
        <div>
          <p className="eyebrow">Procurement</p>
          <h1>New Request for Quotation</h1>
          <p className="muted">Send one structured request to up to 10 vendors.</p>
        </div>
        <AIDraftButton onDraft={applyDraft} />
      </div>

      {error && <div className="error-box">{error}</div>}

      <label>Product name<input value={form.productName} onChange={e => set("productName", e.target.value)} /></label>
      <label>Quantity<input type="number" min="0.000001" step="any" value={form.quantity} onChange={e => set("quantity", e.target.value)} /></label>
      <label>Material / specification<textarea value={form.materialSpec} onChange={e => set("materialSpec", e.target.value)} /></label>

      <div className="two-col">
        <label>Budget minimum<input type="number" min="0" step="any" value={form.budget.min} onChange={e => setBudget("min", e.target.value)} /></label>
        <label>Budget maximum<input type="number" min="0" step="any" value={form.budget.max} onChange={e => setBudget("max", e.target.value)} /></label>
      </div>

      <div className="two-col">
        <label>Currency<input maxLength="3" value={form.budget.currency} onChange={e => setBudget("currency", e.target.value)} /></label>
        <label>Delivery date<input type="date" value={form.deliveryDate} onChange={e => set("deliveryDate", e.target.value)} /></label>
      </div>

      <label>Payment terms<input value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)} placeholder="e.g. Net 30" /></label>
      <label>Shipping method<input value={form.shippingMethod} onChange={e => set("shippingMethod", e.target.value)} /></label>
      <label>Vendor IDs <span className="muted">(comma separated)</span><textarea value={form.vendorIds} onChange={e => set("vendorIds", e.target.value)} placeholder="vendorId1, vendorId2" /></label>

      <button className="primary-button" disabled={isLoading}>{isLoading ? "Creating…" : "Create & Send RFQ"}</button>
    </form>
  );
}
