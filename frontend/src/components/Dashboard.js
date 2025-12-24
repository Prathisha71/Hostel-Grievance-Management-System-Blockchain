import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";

export default function Dashboard({ account, connectMetaMask, disconnectMetaMask }) {
  const [contract, setContract] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Load contract + complaints
  useEffect(() => {
    const loadContractAndData = async () => {
      if (!window.ethereum || !account) return;
      try {
        const res = await axios.get("/api/contract/abi");
        const { abi } = res.data;

        const web3 = new Web3(window.ethereum);
        const contractAddress = "0x94fa2f8CDBe1Ea95F11B5c872b4A448D8033e2E6";

        const c = new web3.eth.Contract(abi, contractAddress);
        setContract(c);

        const allComplaints = await c.methods.getAllComplaints().call();
        const myComplaints = allComplaints.filter(
          (comp) => comp[1].toLowerCase() === account.toLowerCase()
        );
        setComplaints(myComplaints);
      } catch (err) {
        console.error("Error loading contract or complaints:", err);
      }
    };
    loadContractAndData();
  }, [account]);

  // Submit Review
  const handleReview = async (id, satisfied) => {
    if (!contract) {
      alert("Contract not loaded yet!");
      return;
    }
    try {
      let feedback = "";
      if (!satisfied) {
        feedback = prompt("Enter feedback for reopening:");
        if (!feedback) return;
      }

      await contract.methods
        .submitReview(id, satisfied, feedback)
        .send({ from: account });

      alert("Review submitted successfully!");

      const allComplaints = await contract.methods.getAllComplaints().call();
      const myComplaints = allComplaints.filter(
        (comp) => comp[1].toLowerCase() === account.toLowerCase()
      );
      setComplaints(myComplaints);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Transaction failed.");
    }
  };

  // Filtering + sorting
  const filteredComplaints = complaints
    .filter((c) =>
      c[3].toLowerCase().includes(search.toLowerCase()) ||
      c[6].toLowerCase().includes(search.toLowerCase()) ||
      c[7].toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      if (sortField === "id") {
        valA = Number(a[0]);
        valB = Number(b[0]);
      } else if (sortField === "status") {
        valA = Number(a[8]);
        valB = Number(b[8]);
      } else {
        valA = (a[sortField] || "").toLowerCase();
        valB = (b[sortField] || "").toLowerCase();
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: "#3E2723" }}>
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-white" href="/">
            Hostel Complaint System
            <div style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#c7b9b5" }}>
              Voice your issues, get them resolved
            </div>
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-white fw-semibold" href="/dashboard">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white fw-semibold" href="/add-complaint">Add Complaint</a>
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
            <h4 className="fw-bold mb-3">My Complaints</h4>
            <p className="text-muted fst-italic mb-3">
  Only click “Unsatisfied” if your issue isn’t resolved. If you’re satisfied, no action is needed.
</p>


            {/* Search + Sort */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <input
                type="text"
                className="form-control me-2 mb-2"
                placeholder="Search by text, block, category..."
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
                  <option value="status">Status</option>
                  <option value="3">Text</option>
                  <option value="6">Room</option>
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
            {filteredComplaints.length === 0 ? (
              <p className="text-muted">No complaints filed yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Text</th>
                      <th>Block</th>
                      <th>Floor</th>
                      <th>Room</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={Number(c[0])}>
                        <td>{Number(c[0])}</td>
                        <td>{c[3]}</td>
                        <td>{c[4]}</td>
                        <td>{c[5]}</td>
                        <td>{c[6] || "-"}</td>
                        <td>{c[7]}</td>
                        <td>
                          <span
                            className={`badge ${
                              Number(c[8]) === 2
                                ? "bg-success"
                                : Number(c[8]) === 1
                                ? "bg-info"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {["Pending", "InProgress", "Completed"][Number(c[8])]}
                          </span>
                        </td>
<td>
  {Number(c[8]) === 2 ? (
    c[11] && c[11].length > 0 ? (
      <span className="text-success fw-semibold">
        {c[11][c[11].length - 1]}
      </span>
    ) : (
      <div>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleReview(c[0], false)}
        >
          Unsatisfied
        </button>
        <div className="small text-muted mt-1">
          *Do not click if you’re satisfied with the resolution.
        </div>
      </div>
    )
  ) : (
    <span className="text-muted">N/A</span>
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
