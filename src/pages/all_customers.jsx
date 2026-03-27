import { useState, useEffect } from "react";
import "./css/packages.css";
import skyline from "../assets/houston-skyline.jpeg";
import React from 'react'

export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [customerPackages, setCustomerPackages] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load customers");
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  let filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.Full_Name || "").toLowerCase().includes(q) ||
      (c.Email_Address || "").toLowerCase().includes(q) ||
      (c.Phone_Number || "").toLowerCase().includes(q) ||
      (c.Full_Address || "").toLowerCase().includes(q)
    );
  });

    if (sortValue === "name_asc")  filtered = [...filtered].sort((a, b) => a.Full_Name.localeCompare(b.Full_Name));
    if (sortValue === "name_desc") filtered = [...filtered].sort((a, b) => b.Full_Name.localeCompare(a.Full_Name));

    

function toggleExpand(id) {
    if (expanded === id) {
    setExpanded(null);
    return;
    }
    setExpanded(id);
    fetch(`http://localhost:5000/api/customers/${id}/packages`)
    .then(res => res.json())
    .then(data => setCustomerPackages(prev => ({ ...prev, [id]: data })))
    .catch(() => setCustomerPackages(prev => ({ ...prev, [id]: [] })));
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
        <div className="hero">
          <img src={skyline} alt="Post Office" />
        </div>

        <div className="page-content">
          <h2>All Customers</h2>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {!loading && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{customers.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          )}

          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search name, email, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
              <option value="">Sort: Default</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
            </select>
            <span className="result-count">{filtered.length} of {customers.length} customers</span>
          </div>

          {loading ? (
            <p className="state-msg">Loading customers...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No customers match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <React.Fragment key={c.Customer_ID}>
                      <tr key={c.Customer_ID}>
                        <td><code>{c.Customer_ID}</code></td>
                        <td>{c.Full_Name}</td>
                        <td>{c.Email_Address || "—"}</td>
                        <td>{c.Phone_Number || "—"}</td>
                        <td>{c.Full_Address || "—"}</td>
                        <td>
                          <button
                            className="button"
                            style={{ padding: "5px 12px", fontSize: "0.8rem", marginTop: 0 }}
                            onClick={() => toggleExpand(c.Customer_ID)}
                          >
                            {expanded === c.Customer_ID ? "▲ Hide" : "▼ More"}
                          </button>
                        </td>
                      </tr>

                      {expanded === c.Customer_ID && (
                        <tr key={`${c.Customer_ID}-detail`} className="detail-row">
                            <td colSpan={6}>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Country</label>
                                        <p>{c.Country || "—"}</p>
                                     </div>
                                    <div className="detail-item">
                                        <label>ZIP+4</label>
                                        <p>{c.Zip_Plus4 || "—"}</p>
                                    </div>
                                    <div className="detail-item">
                                         <label>Sending</label>
                                        <p>
                                            {(customerPackages[c.Customer_ID] || [])
                                            .filter(p => p.Role === 'Sending')
                                            .map(p => <code key={p.Tracking_Number} style={{ display: 'block' }}>{p.Tracking_Number}</code>)
                                            }
                                            {!(customerPackages[c.Customer_ID] || []).some(p => p.Role === 'Sending') && "—"}
                                        </p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Receiving</label>
                                        <p>
                                        {(customerPackages[c.Customer_ID] || [])
                                        .filter(p => p.Role === 'Receiving')
                                        .map(p => <code key={p.Tracking_Number} style={{ display: 'block' }}>{p.Tracking_Number}</code>)
                                        }
                                        {!(customerPackages[c.Customer_ID] || []).some(p => p.Role === 'Receiving') && "—"}
                                        </p>
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
