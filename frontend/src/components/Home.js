import React from "react";

const Home = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark" style={{ backgroundColor: "#3E2723" }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Hostel Complaint Management
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container flex-grow-1 d-flex align-items-center py-5">
        <div className="row w-100">
          {/* Left Side */}
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <h1 className="fw-bold mb-3" style={{ color: "#3E2723" }}>
              Hostel Complaint Management System
            </h1>
            <p className="text-muted fs-5">
              A streamlined way to manage, track, and resolve hostel complaints
              efficiently. Students can raise issues, and admins can monitor
              progress — all in one place.
            </p>
          </div>

          {/* Right Side */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <div className="card shadow-lg border-0 p-4" style={{ borderRadius: "12px", minWidth: "320px" }}>
              <h3 className="text-center mb-4" style={{ color: "#3E2723" }}>
                Get Started
              </h3>
              <button
                onClick={handleGoogleLogin}
                className="btn btn-danger w-100 fw-bold mb-3"
              >
                <i className="bi bi-google me-2"></i> Login with Google
              </button>
              <p className="text-muted text-center small mb-3">
                Secure authentication powered by Google OAuth
              </p>
              <hr />
              <h5 className="text-center mb-3" style={{ color: "#5D4037" }}>
                Local Developer Login
              </h5>
              <div className="d-grid gap-2">
                <a href="http://localhost:4000/auth/dev-login?role=student" className="btn btn-outline-dark btn-sm fw-semibold">
                  Login as Student
                </a>
                <a href="http://localhost:4000/auth/dev-login?role=lowerAdmin" className="btn btn-outline-secondary btn-sm fw-semibold">
                  Login as Lower Admin
                </a>
                <a href="http://localhost:4000/auth/dev-login?role=higherAdmin" className="btn btn-outline-primary btn-sm fw-semibold">
                  Login as Higher Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center text-white py-3 mt-auto"
        style={{ backgroundColor: "#3E2723" }}
      >
        © {new Date().getFullYear()} Hostel Complaint Management · All rights
        reserved
      </footer>
    </div>
  );
};

export default Home;

