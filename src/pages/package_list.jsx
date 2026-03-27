import { useState, useEffect } from "react";
import "./css/packages.css";
import React from "react";

import skyline from "../assets/houston-skyline.jpeg";

export default function AllPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/packages")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load packages");
        return res.json();
      })
      .then((data) => {
        setPackages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  let filtered = packages.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      (p.Tracking_Number || "").toLowerCase().includes(q) ||
      (p.Package_Type_Code || "").toLowerCase().includes(q) ||
      String(p.Zone || "").includes(q);
    const matchFilter =
      !filterValue ||
      (filterValue === "oversize" && p.Oversize === 1) ||
      (filterValue === "signature" && p.Requires_Signature === 1);
    return matchSearch && matchFilter;
  });

  if (sortValue === "weight_asc")  filtered = [...filtered].sort((a, b) => a.Weight - b.Weight);
  if (sortValue === "weight_desc") filtered = [...filtered].sort((a, b) => b.Weight - a.Weight);
  if (sortValue === "price_asc")   filtered = [...filtered].sort((a, b) => a.Price - b.Price);
  if (sortValue === "price_desc")  filtered = [...filtered].sort((a, b) => b.Price - a.Price);

  function statusBadge(status) {
    const s = (status || "").toLowerCase();
    const style = s.includes("deliver") ? { background: "#d1fae5", color: "#065f46" }
      : s.includes("transit")           ? { background: "#dbeafe", color: "#1e40af" }
      : s.includes("delay")             ? { background: "#fee2e2", color: "#991b1b" }
      :                                   { background: "#fef9c3", color: "#854d0e" };
    return (
      <span className="status-badge" style={style}>
        {status || "Unknown"}
      </span>
    );
  }

  function toggleExpand(trackingNumber) {
    setExpanded(expanded === trackingNumber ? null : trackingNumber);
  }

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
          <h2>All Packages</h2>

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
                <span className="stat-num">{packages.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-num delivered">{packages.filter((p) => (p.Status_Name || "").toLowerCase().includes("deliver")).length}</span>
                <span className="stat-label">Delivered</span>
              </div>
              <div className="stat-card">
                <span className="stat-num transit">{packages.filter((p) => (p.Status_Name || "").toLowerCase().includes("transit")).length}</span>
                <span className="stat-label">In Transit</span>
              </div>
              <div className="stat-card">
                <span className="stat-num pending">{packages.filter((p) => (p.Status_Name || "").toLowerCase().includes("pending")).length}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search tracking #, type, zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
              <option value="">All Packages</option>
              <option value="oversize">Oversize Only</option>
              <option value="signature">Requires Signature</option>
            </select>
            <select className="filter-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
              <option value="">Sort: Default</option>
              <option value="weight_asc">Weight (Low → High)</option>
              <option value="weight_desc">Weight (High → Low)</option>
              <option value="price_asc">Price (Low → High)</option>
              <option value="price_desc">Price (High → Low)</option>
            </select>
            <span className="result-count">{filtered.length} of {packages.length} packages</span>
          </div>

          {/* Content */}
          {loading ? (
            <p className="state-msg">Loading packages...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No packages match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Type</th>
                    <th>Weight</th>
                    <th>Zone</th>
                    <th>Price</th>
                    <th>Oversize</th>
                    <th>Sig. Required</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <React.Fragment key={p.Tracking_Number}>
                      <tr key={p.Tracking_Number}>
                        <td><code>{p.Tracking_Number}</code></td>
                        <td>{p.Package_Type_Code}</td>
                        <td>{p.Weight} lbs</td>
                        <td>{p.Zone}</td>
                        <td>${parseFloat(p.Price || 0).toFixed(2)}</td>
                        <td>{p.Oversize ? "Yes" : "No"}</td>
                        <td>{p.Requires_Signature ? "Yes" : "No"}</td>
                        <td>{p.Date_Created ? new Date(p.Date_Created).toLocaleDateString() : "—"}</td>
                        <td>{statusBadge(p.Status_Name)}</td>
                        <td>
                          <button className="button" style={{ padding: "5px 12px", fontSize: "0.8rem", marginTop: 0 }} onClick={() => toggleExpand(p.Tracking_Number)}>
                            {expanded === p.Tracking_Number ? "▲ Hide" : "▼ More"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expanded === p.Tracking_Number && (
                        <tr key={`${p.Tracking_Number}-detail`} className="detail-row">
                          <td colSpan={10}>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Dimensions</label>
                                <p>{p.Dim_X}" × {p.Dim_Y}" × {p.Dim_Z}"</p>
                              </div>
                              <div className="detail-item">
                                <label>Sender ID</label>
                                <p>{p.Sender_ID || "—"}</p>
                              </div>
                              <div className="detail-item">
                                <label>Recipient ID</label>
                                <p>{p.Recipient_ID || "—"}</p>
                              </div>
                              <div className="detail-item">
                                <label>Date Updated</label>
                                <p>{p.Date_Updated ? new Date(p.Date_Updated).toLocaleDateString() : "—"}</p>
                              </div>
                              <div className="detail-item">
                                <label>Final Status</label>
                                <p>{p.Is_Final_Status ? "✅ Final" : "🔄 In Progress"}</p>
                              </div>
                              <div className="detail-item">
                                <label>Delivered Date</label>
                                <p>{p.Delivered_Date ? new Date(p.Delivered_Date).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
