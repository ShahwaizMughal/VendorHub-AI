import { useParams } from "react-router-dom";
import Timeline from "../components/rfq/Timeline";
import { useGetOrderQuery, useUpdateOrderStatusMutation } from "../services/rfqApi";

const nextStatuses = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["in_production", "cancelled"],
  in_production: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
};

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetOrderQuery(id);
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  if (isLoading) return <div className="card">Loading order…</div>;
  if (error) return <div className="card error-box">Unable to load order.</div>;
  const order = data.data;
  const options = nextStatuses[order.status] || [];

  return <div className="stack"><section className="card"><div className="page-header"><div><p className="eyebrow">Order</p><h1>{order.productName}</h1></div><span className="status">{order.status}</span></div><div className="details-grid"><div><span>Quantity</span><strong>{order.quantity}</strong></div><div><span>Total</span><strong>{order.totalPrice} {order.currency}</strong></div></div>{options.length > 0 && <div className="actions">{options.map(status => <button key={status} className={status === "cancelled" ? "danger-button" : "primary-button"} disabled={updating} onClick={() => updateStatus({ id, status })}>{status.replaceAll("_", " ")}</button>)}</div>}</section><section className="card"><h2>Status timeline</h2><Timeline history={order.statusHistory} /></section></div>;
}
