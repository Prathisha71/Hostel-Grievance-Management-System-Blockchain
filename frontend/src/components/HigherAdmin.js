import React, { useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";

const STATUS = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2
};

export default function HigherAdmin({ account, connectMetaMask, disconnectMetaMask }) {
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

        // 🔑 Higher Admin: complaints older than 3 days and NOT completed
        const now = Math.floor(Date.now() / 1000);
        const threeDays = 3 * 24 * 60 * 60;
        const oldComplaints = mapped.filter(
          (c) => now - c.timestamp > threeDays && c.status !== STATUS.COMPLETED
        );

        setComplaints(oldComplaints);
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
      const threeDays = 3 * 24 * 60 * 60;
      const oldComplaints = mapped.filter(
        (c) => now - c.timestamp > threeDays && c.status !== STATUS.COMPLETED
      );
      setComplaints(oldComplaints);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filtered = complaints
    .filter(
      (c) =>
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
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: "#3E2723" }}>
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-white" href="/">
            Hostel Complaint System (Higher Admin)
            <div style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#c7b9b5" }}>
              Voice your issues, get them resolved
            </div>
          </a>
          <a className="navbar-brand fw-bold text-white" href="/adminannouncement">Announcement</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-white fw-semibold" href="/higher-admin">Admin Dashboard</a>
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

      {/* Main Content */}
      <div className="container-fluid mt-4 mb-5 flex-grow-1">
        <div className="card shadow-sm border-0 rounded-3 w-100">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">Complaints older than 3 days (not completed)</h4>

            {/* Search + Sort */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <input
                type="text"
                className="form-control me-2 mb-2"
                placeholder="Search complaints..."
                style={{ flex: "1 1 auto", maxWidth: "65%" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div>
                <label className="me-2 fw-bold">Sort by:</label>
                <select
                  className="form-select d-inline-block w-auto"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="id">ID</option>
                  <option value="blockName">Block</option>
                  <option value="category">Category</option>
                  <option value="status">Status</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-dark ms-2"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {/* Complaints Table */}
            {filtered.length === 0 ? (
              <p className="text-muted">No complaints match the criteria.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Block</th>
                      <th>Room</th>
                      <th>Category</th>
                      <th>Text</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.blockName}</td>
                        <td>{c.roomNo}</td>
                        <td>{c.category}</td>
                        <td>{c.text}</td>
                        <td>{new Date(c.timestamp * 1000).toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              c.status === STATUS.COMPLETED
                                ? "bg-success"
                                : c.status === STATUS.IN_PROGRESS
                                ? "bg-info text-dark"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {["Pending", "In Progress", "Completed"][c.status]}
                          </span>
                        </td>
                        <td>
                          {c.status === STATUS.PENDING && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => handleChangeStatus(c.id, STATUS.IN_PROGRESS)}
                              >
                                In Progress
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleChangeStatus(c.id, STATUS.COMPLETED)}
                              >
                                Completed
                              </button>
                            </>
                          )}
                          {c.status === STATUS.IN_PROGRESS && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleChangeStatus(c.id, STATUS.COMPLETED)}
                            >
                              Completed
                            </button>
                          )}
                          {c.status === STATUS.COMPLETED && (
                            <span className="fw-bold text-success">✔ Done</span>
                          )}
                        </td>
                        <td>
                          {c.feedbacks.length > 0 ? (
                            <span className="text-muted small">
                              {c.feedbacks[c.feedbacks.length - 1]}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center py-3" style={{ background: "#3E2723", color: "white" }}>
        <small>© {new Date().getFullYear()} Hostel Complaint System · All rights reserved</small>
      </footer>
    </div>
  );
}
