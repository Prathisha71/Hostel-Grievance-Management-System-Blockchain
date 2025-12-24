import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("/api/announcement/all"); // Updated endpoint
        setAnnouncements(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Navigate to Edit page
  const handleEdit = (id) => {
    navigate(`/edit-announcement/${id}`);
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`/api/announcement/delete/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete announcement");
    }
  };

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: "#3E2723" }}>
  <div className="container-fluid d-flex align-items-center justify-content-between">
    <a className="navbar-brand fw-bold text-white" href="/">
      Hostel Complaint System (Higher Admin)
      <div style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#c7b9b5" }}>
        Voice your issues, get them resolved
      </div>
    </a>

    <div className="d-flex align-items-center">
      <a
        href="/higher-admin"
        className="btn btn-outline-light btn-sm me-2"
        style={{ textDecoration: "none" }}
      >
        Dashboard
      </a>
      <button
        className="btn btn-outline-light btn-sm"
        onClick={() => navigate("/add-announcement")}
      >
        Add Announcement
      </button>
    </div>
  </div>
</nav>


      {/* Main Content */}
      <div className="container mt-4 flex-grow-1">
        {loading ? (
          <p className="text-center mt-5">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="text-center mt-5">
            <img
              src="/empty-box.png"
              alt="No announcements"
              style={{ width: "120px", opacity: 0.5 }}
            />
            <p className="text-muted mt-3">
              No announcements available. Click "Add Announcement" to create one.
            </p>
          </div>
        ) : (
          <div className="list-group">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <h5 className="mb-1">{ann.title}</h5>
                  <p className="mb-1">{ann.body}</p>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(ann._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(ann._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center py-3" style={{ background: "#3E2723", color: "white" }}>
        <small>© {new Date().getFullYear()} Hostel Complaint System · All rights reserved</small>
      </footer>
    </div>
  );
}
