import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../services/rfqApi";

export default function OrdersList() {
  const { data, isLoading, error } = useGetOrdersQuery();
  if (isLoading) return <div className="card">Loading orders…</div>;
  if (error) return <div className="card error-box">Unable to load orders.</div>;
  const orders = data.data || [];

  return <section className="card"><div className="page-header"><div><p className="eyebrow">Procurement</p><h1>Orders</h1></div></div>{orders.length ? <div className="table-wrap"><table><thead><tr><th>Product</th><th>Total</th><th>Status</th><th>Created</th></tr></thead><tbody>{orders.map(order => <tr key={order._id}><td><Link to={`/orders/${order._id}`}>{order.productName}</Link></td><td>{order.totalPrice} {order.currency}</td><td><span className="status">{order.status}</span></td><td>{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">No orders yet.</div>}</section>;
}
