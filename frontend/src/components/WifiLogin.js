import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const WifiLogin = ({ account, connectMetaMask, disconnectMetaMask }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Pre-fill email from logged-in user
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/wifi/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, wifiName, wifiPassword }),
      });
      const data = await response.json();

      if (data.success) {
        // Credentials correct → redirect to Dashboard
        navigate("/dashboard");
      } else {
        setMessage(data.message || data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark" style={{ backgroundColor: "#3E2723" }}>
        <div className="container-fluid d-flex justify-content-between">
          <span className="navbar-brand fw-bold">Hostel Complaint Management</span>
          {/* MetaMask Connect/Disconnect */}
          <div>
            {account ? (
              <button className="btn btn-outline-light" onClick={disconnectMetaMask}>
                {account.slice(0, 6)}...{account.slice(-4)} (Disconnect)
              </button>
            ) : (
              <button className="btn btn-outline-light" onClick={connectMetaMask}>
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Wi-Fi Login Section */}
      <div className="container flex-grow-1 d-flex align-items-center py-5">
        <div className="row w-100 justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0 p-4" style={{ borderRadius: "12px" }}>
              <h3 className="text-center mb-4" style={{ color: "#3E2723" }}>
                Enter Wi-Fi Credentials
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    readOnly // user cannot change email
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Wi-Fi Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Wi-Fi Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-danger w-100 fw-bold">
                  Check Credentials
                </button>
              </form>

              {message && (
                <p className="text-center mt-3" style={{ color: "#3E2723" }}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center text-white py-3 mt-auto"
        style={{ backgroundColor: "#3E2723" }}
      >
        © {new Date().getFullYear()} Hostel Complaint Management · All rights reserved
      </footer>
    </div>
  );
};

export default WifiLogin;
