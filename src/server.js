import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRoutes from "./routes/auth.js";
import announcementRouter from "./routes/announcementRoutes.js";
import User from "./models/User.js";
import wifi from "./models/Wifi.js";
import { checkWifiCredentials } from "./controllers/wifiController.js";
import fs from "fs/promises"; // Use promise-based fs for async/await

// Load env variables
dotenv.config();

// Express setup
const app = express();
app.use(express.json());

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/build")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo connection error", err));

// Session & Passport setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ googleId: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Auth routes
app.use("/auth", authRoutes);
app.use("/api/announcement",announcementRouter);
// ----------------------
// Contract ABI endpoint
// ----------------------

app.post("/api/wifi/check", checkWifiCredentials);
app.get("/api/contract/abi", async (req, res) => {
  try {
    const contractPath = path.join(
      __dirname,
      "../build/contracts/HostelComplaintSystem.json"
    );

    const contractFile = await fs.readFile(contractPath, "utf-8");
    const contractData = JSON.parse(contractFile);

    // Replace 5777 with your Ganache network ID
    const networkId = "5777";
    const contractAddress = contractData.networks[networkId]?.address;

    if (!contractAddress) {
      return res.status(500).json({ error: "Contract not deployed on this network" });
    }

    res.json({ abi: contractData.abi, address: contractAddress });
  } catch (err) {
    console.error("Failed to retrieve contract ABI:", err);
    res.status(500).json({ error: "Failed to retrieve contract ABI" });
  }
});

// ----------------------
// Fallback to React app
// ----------------------
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
async function addMultipleWifi() {
  try {
    const wifiEntries = await wifi.create([
      {
        email: "divyaprabagaran2006@gmail.com",
        wifiName: "HomeWiFi1",
        wifiPassword: "Password1"
      },
      {
        email: "kalpanaprabagaran77@gmail.com",
        wifiName: "HomeWiFi2",
        wifiPassword: "Password2"
      },
      {
        email: "pkalpanabalu@gmail.com",
        wifiName: "HomeWiFi3",
        wifiPassword: "Password3"
      }
    ]);

    console.log("Inserted:", wifiEntries);
  } catch (err) {
    console.error(err);
  }
}

addMultipleWifi();