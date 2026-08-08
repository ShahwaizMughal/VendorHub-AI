import { Link, Route, Routes } from "react-router-dom";
import RFQBuilder from "./pages/RFQBuilder";
import RFQDetail from "./pages/RFQDetail";
import QuoteComparison from "./pages/QuoteComparison";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";
import "./App.css";

function App() {
  return <div className="app-shell"><header className="navbar"><Link className="brand" to="/rfqs/new">VendorHub AI</Link><nav><Link to="/rfqs/new">New RFQ</Link><Link to="/orders">Orders</Link></nav></header><main className="content"><Routes><Route path="/" element={<RFQBuilder />} /><Route path="/rfqs/new" element={<RFQBuilder />} /><Route path="/rfqs/:id" element={<RFQDetail />} /><Route path="/rfqs/:id/quotes" element={<QuoteComparison />} /><Route path="/orders" element={<OrdersList />} /><Route path="/orders/:id" element={<OrderDetail />} /></Routes></main></div>;
}

export default App;
