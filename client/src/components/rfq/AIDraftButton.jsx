export default function AIDraftButton({ onDraft }) {
  const handleDraft = () => {
    const query = localStorage.getItem("lastSearchQuery") || "";
    onDraft({
      productName: query,
      quantity: 1,
      materialSpec: "",
      budget: { min: "", max: "", currency: "USD" },
      paymentTerms: "Net 30",
      shippingMethod: "Standard",
    });
  };

  return (
    <button type="button" className="secondary-button" onClick={handleDraft}>
      AI Draft
    </button>
  );
}
