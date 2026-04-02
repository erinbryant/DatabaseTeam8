import { useState, useEffect } from "react";
import "./css/packages.css";
import skyline from "../assets/houston-skyline.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || '';

const LOW_STOCK = 15;
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_TEST);
console.log(import.meta.env.VITE_API_URL);
export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/inventory`)
    //fetch(`${API_BASE}/api/inventory`)
    
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load inventory");
        return res.json();
      })
      .then((data) => {
        setInventory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function getLevel(qty) {
    if (qty === 0) return "Out of Stock";
    if (qty <= LOW_STOCK) return "Low Stock";
    return "In Stock";
  }

  function stockBadgeStyle(qty) {
    if (qty === 0)        return { background: "#fee2e2", color: "#991b1b" };
    if (qty <= LOW_STOCK) return { background: "#fef9c3", color: "#854d0e" };
    return                       { background: "#d1fae5", color: "#065f46" };
  }

  const locations = [...new Set(inventory.map((i) => `${i.city}, ${i.state}`).filter(Boolean))];

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.product_name || "").toLowerCase().includes(q) ||
      (item.upc || "").toLowerCase().includes(q) ||
      (item.city || "").toLowerCase().includes(q);
    const locStr = `${item.city}, ${item.state}`;
    return (
      matchSearch &&
      (!locFilter   || locStr === locFilter) &&
      (!stockFilter || getLevel(item.quantity) === stockFilter)
    );
  });

  const totalUnits = filtered.reduce((s, i) => s + (i.quantity || 0), 0);
  const outCount   = filtered.filter((i) => i.quantity === 0).length;
  const lowCount   = filtered.filter((i) => i.quantity > 0 && i.quantity <= LOW_STOCK).length;

  return (
    <>
      <header className="navbar">
        <h1>Post Office 8</h1>
        <nav>
          <a href="/employee_home">Home</a>
          <a href="/package_list">Packages</a>
          <a href="/inventory">Inventory</a>
          <a href="/">Logout</a>
        </nav>
      </header>

      <main>
        {/* Hero image */}
        <div className="hero">
          <img src={skyline} alt="Post Office" />
        </div>

        <div className="page-content">
          <h2>Inventory</h2>

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Stats */}
          {!loading && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{filtered.length}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-card">
                <span className="stat-num delivered">{totalUnits.toLocaleString()}</span>
                <span className="stat-label">Total Units</span>
              </div>
              <div className="stat-card">
                <span className="stat-num pending">{lowCount}</span>
                <span className="stat-label">Low Stock</span>
              </div>
              <div className="stat-card">
                <span className="stat-num delayed">{outCount}</span>
                <span className="stat-label">Out of Stock</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search product, UPC, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select className="filter-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <span className="result-count">{filtered.length} of {inventory.length} products</span>
          </div>

          {/* Table */}
          {loading ? (
            <p className="state-msg">Loading inventory...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No products match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>UPC</th>
                    <th>Post Office</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={`${item.post_office_id}-${item.upc}`}>
                      <td>
                        <div className="td-name">{item.product_name || "—"}</div>
                        <div className="td-sub">Store #{item.store_id}</div>
                      </td>
                      <td><code>{item.upc || "—"}</code></td>
                      <td>
                        <div className="td-name">{item.city}, {item.state}</div>
                        <div className="td-sub">{item.office_address}</div>
                      </td>
                      <td>
                        {item.price == 0
                          ? <span className="free-label">Free</span>
                          : `$${parseFloat(item.price).toFixed(2)}`}
                      </td>
                      <td>
                        {/* Stock bar */}
                        <div className="stock-bar-wrap">
                          <div className="stock-bar-bg">
                            <div
                              className="stock-bar-fill"
                              style={{
                                width: `${Math.min((item.quantity / 500) * 100, 100)}%`,
                                backgroundColor:
                                  item.quantity === 0 ? "#fca5a5" :
                                  item.quantity <= LOW_STOCK ? "#fde68a" : "#3333cc",
                              }}
                            />
                          </div>
                          <span className="stock-bar-num">{item.quantity}</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge" style={stockBadgeStyle(item.quantity)}>
                          {getLevel(item.quantity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">
                Showing {filtered.length} of {inventory.length} records
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <p>Database Team 8</p>
      </footer>
    </>
  );
}

