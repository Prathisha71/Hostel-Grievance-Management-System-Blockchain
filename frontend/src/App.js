import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import LowerAdmin from "./components/LowerAdmin";
import HigherAdmin from "./components/HigherAdmin";
import AdminAnnouncement from "./components/AdminAnnouncement";
import EditAnnouncement from "./components/editAnnouncement";
import AddAnnouncement from "./components/addAnnouncement";
import OAuthRedirect from "./components/OAuthRedirect";
import WifiLogin from "./components/WifiLogin"; // Adjust the path according to your folder structure
import { AuthContext } from "./context/AuthContext";
import AddComplaintForm from "./components/AddComplaint";

function App() {
  const { token, user, loading } = useContext(AuthContext);

  // ✅ MetaMask state lifted to App.js and persisted
  const [account, setAccount] = useState(localStorage.getItem("metamaskAccount") || null);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("metamaskAccount", accounts[0]); // ✅ persist
      } catch (err) {
        console.error("MetaMask connection error:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectMetaMask = () => {
    setAccount(null);
    localStorage.removeItem("metamaskAccount"); // ✅ clear persistence
  };

  // ✅ Restore connection & listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("metamaskAccount", accounts[0]);
        }
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        const acc = accounts[0] || null;
        setAccount(acc);
        if (acc) {
          localStorage.setItem("metamaskAccount", acc);
        } else {
          localStorage.removeItem("metamaskAccount");
        }
      });
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ Pass connect & disconnect to both */}
        <Route
          path="/add-complaint"
          element={
            <AddComplaintForm
              account={account}
              connectMetaMask={connectMetaMask}
              disconnectMetaMask={disconnectMetaMask}
            />
          }
        />

        <Route path="/oauth-redirect" element={<OAuthRedirect />} />

        <Route
          path="/dashboard"
          element={
            token && user?.role === "student" ? (
              <Dashboard
                account={account}
                connectMetaMask={connectMetaMask}
                disconnectMetaMask={disconnectMetaMask}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
  path="/lower-admin"
  element={
    token && user?.role === "lowerAdmin" ? (
      <LowerAdmin
        account={account}
        connectMetaMask={connectMetaMask}
        disconnectMetaMask={disconnectMetaMask}
      />
    ) : (
      <Navigate to="/" />
    )
  }
/>
{/* Admin Announcement List */}
<Route
  path="/adminannouncement"
  element={
    token && user?.role === "higherAdmin" ? (
      <AdminAnnouncement
        account={account}
        connectMetaMask={connectMetaMask}
        disconnectMetaMask={disconnectMetaMask}
      />
    ) : (
      <Navigate to="/" />
    )
  }
/>

{/* Add New Announcement */}
<Route
  path="/add-announcement"
  element={
    token && user?.role === "higherAdmin" ? (
      <AddAnnouncement />
    ) : (
      <Navigate to="/" />
    )
  }
/>

{/* Edit Announcement */}
<Route
  path="/edit-announcement/:id"
  element={
    token && user?.role === "higherAdmin" ? (
      <EditAnnouncement />
    ) : (
      <Navigate to="/" />
    )
  }
/>


        <Route
  path="/higher-admin"
  element={
    token && user?.role === "higherAdmin" ? (
      <HigherAdmin
        account={account}
        connectMetaMask={connectMetaMask}
        disconnectMetaMask={disconnectMetaMask}
      />
    ) : (
      <Navigate to="/" />
    )
  }
/>
<Route
  path="/wifi-login"
  element={
    token && user?.role === "student" ? (
      <WifiLogin
        account={account}
        connectMetaMask={connectMetaMask}
        disconnectMetaMask={disconnectMetaMask}
      />
    ) : (
      <Navigate to="/" />
    )
  }
/>

  </Routes>
    </Router>
  );
}

export default App;
