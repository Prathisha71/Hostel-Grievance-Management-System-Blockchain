import Wifi from "../models/Wifi.js"; // adjust path if needed

// Check if Wi-Fi credentials match
export const checkWifiCredentials = async (req, res) => {
  try {
    const { email, wifiName, wifiPassword } = req.body;

    if (!email || !wifiName || !wifiPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Find record by email and Wi-Fi name
    const wifiEntry = await Wifi.findOne({ email, wifiName });

    if (!wifiEntry) {
      return res.status(404).json({ success: false, message: "Wi-Fi entry not found" });
    }

    // Direct comparison since passwords are stored as plain text
    if (wifiEntry.wifiPassword === wifiPassword) {
      return res.status(200).json({ success: true, message: "Wi-Fi credentials match" });
    } else {
      return res.status(401).json({ success: false, message: "Wi-Fi credentials do not match" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
