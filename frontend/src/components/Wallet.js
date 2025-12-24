import React, { useState } from "react";
import API from "../api";

function Wallet({ user, token }) {
  const [wallet, setWallet] = useState(user.wallet || null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found!");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      const res = await API.post("/auth/link-wallet", { token, walletAddress });
      setWallet(res.data.user.wallet);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Wallet linked successfully!");
    } catch (err) {
      console.log("in wallet");
      console.error(err);
      alert("Wallet link failed");
    }
  };

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Wallet: {wallet || "Not linked yet"}</p>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
}

export default Wallet;
