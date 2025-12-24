import React, { useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";

export default function LowerAdmin({ account, connectMetaMask, disconnectMetaMask }) {
  const [contract, setContract] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum || !account) return;
      try {
        const res = await axios.get("/api/contract/abi");
        const abi = res.data.abi;
        const contractAddress = "0x94fa2f8CDBe1Ea95F11B5c872b4A448D8033e2E6";
        const web3 = new Web3(window.ethereum);
        const c = new web3.eth.Contract(abi, contractAddress);
        setContract(c);

        const allComplaints = await c.methods.getAllComplaints().call();
        const mapped = allComplaints.map((c) => ({
          id: Number(c.id),
          blockName: c.blockName,
          roomNo: c.roomNo || "N/A",
          category: c.category,
          text: c.text,
          timestamp: Number(c.timestamp),
          status: Number(c.status),
          feedbacks: c.feedbacks || []
        }));
        const now = Math.floor(Date.now() / 1000);
        const recent = mapped.filter(c => now - c.timestamp <= 3 * 24 * 60 * 60);
        setComplaints(recent);
      } catch (err) {
        console.error("Error loading contract or complaints:", err);
      }
    };
    loadContract();
  }, [account]);

  const handleChangeStatus = async (id, status) => {
    if (!contract) return;
    try {
      await contract.methods.changeStatus(id, status).send({ from: account });
      const allComplaints = await contract.methods.getAllComplaints().call();
      const mapped = allComplaints.map((c) => ({
        id: Number(c.id),
        blockName: c.blockName,
        roomNo: c.roomNo || "N/A",
        category: c.category,
        text: c.text,
        timestamp: Number(c.timestamp),
        status: Number(c.status),
        feedbacks: c.feedbacks || []
      }));
      const now = Math.floor(Date.now() / 1000);
      const recent = mapped.filter(c => now - c.timestamp <= 3 * 24 * 60 * 60);
      setComplaints(recent);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filtered = complaints
    .filter(
      c =>
        c.text.toLowerCase().includes(search.toLowerCase()) ||
        c.blockName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "id": valA = a.id; valB = b.id; break;
        case "blockName": valA = a.blockName.toLowerCase(); valB = b.blockName.toLowerCase(); break;
        case "category": valA = a.category.toLowerCase(); valB = b.category.toLowerCase(); break;
        case "status": valA = a.status; valB = b.status; break;
        default: valA = a.id; valB = b.id;
      }
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: "#3E2723" }}>
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-white" href="/">
            Hostel Complaint System (Lower Admin)
            <div style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#c7b9b5" }}>
              Voice your issues, get them resolved
            </div>
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-white fw-semibold" href="/lower-admin">Admin Dashboard</a>
              </li>
            </ul>
            <div className="ms-3">
              {account ? (
                <div className="d-flex align-items-center">
                  <span className="badge bg-light text-dark me-2">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button className="btn btn-outline-light btn-sm" onClick={disconnectMetaMask}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn btn-warning btn-sm" onClick={connectMetaMask}>
                  Connect MetaMask
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Filters */}
      <div className="container my-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search complaints..."
          style={{ maxWidth: "320px" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={sortField}
            onChange={e => setSortField(e.target.value)}
          >
            <option value="id">Sort by ID</option>
            <option value="blockName">Sort by Block</option>
            <option value="category">Sort by Category</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            className="btn btn-dark"
            style={{ backgroundColor: "#5D4037", border: "none" }}
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
      </div>

      {/* Complaints Cards */}
      <div className="container flex-grow-1">
        <div className="row">
          {filtered.length === 0 && (
            <div className="col-12 text-center text-muted py-5">
              No complaints within last 3 days.
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-brown fw-bold">Complaint #{c.id}</h5>
                  <p className="mb-1"><strong>Block:</strong> {c.blockName} | <strong>Room:</strong> {c.roomNo}</p>
                  <p className="mb-1"><strong>Category:</strong> {c.category}</p>
                  <p className="mb-2 text-muted">{c.text}</p>

                  <span className={`badge mb-2 align-self-start px-3 py-2 rounded-pill ${
                    c.status === 0 ? "bg-warning text-dark" :
                    c.status === 1 ? "bg-info text-dark" :
                    "bg-success"
                  }`}>
                    {["Pending", "In Progress", "Completed"][c.status]}
                  </span>

                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {c.status === 0 && <>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        style={{ borderColor: "#5D4037", color: "#5D4037" }}
                        onClick={() => handleChangeStatus(c.id, 1)}
                      >
                        In Progress
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#5D4037", color: "white" }}
                        onClick={() => handleChangeStatus(c.id, 2)}
                      >
                        Completed
                      </button>
                    </>}
                    {c.status === 1 && (
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#5D4037", color: "white" }}
                        onClick={() => handleChangeStatus(c.id, 2)}
                      >
                        Completed
                      </button>
                    )}
                    {c.status === 2 && (
                      <span className="fw-bold text-success">✔ Completed</span>
                    )}
                  </div>

                  <p className="mt-2 mb-0 text-muted small">
  <strong>Feedback:</strong>{" "}
  {c.feedbacks.length > 0
    ? c.feedbacks[c.feedbacks.length - 1]
    : "Feedback not received"}
</p>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center py-3" style={{ background: "#3E2723", color: "white" }}>
        <small>© {new Date().getFullYear()} Hostel Complaint System · All rights reserved</small>
      </footer>
    </div>
  );
}
