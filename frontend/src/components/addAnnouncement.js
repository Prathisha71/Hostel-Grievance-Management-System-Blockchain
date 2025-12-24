import React, { useState } from "react";
import axios from "axios";

export default function AddAnnouncement() {
  const [form, setForm] = useState({ title: "", body: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // No need to send authorId; backend uses req.user._id
      await axios.post("/api/announcement/add", form);
      alert("Announcement added successfully!");
      window.location.href = "/adminannouncement";
    } catch (err) {
      console.error("Error adding announcement:", err.response?.data || err);
      alert("Failed to add announcement");
    }
  };

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
        </div>
      </nav>

      {/* Form */}
      <div className="container mt-5 flex-grow-1">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">Add New Announcement</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Body</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-dark w-100">
                Submit Announcement
              </button>
            </form>
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
