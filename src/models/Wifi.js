import mongoose from "mongoose";

const { Schema } = mongoose;

const wifiSchema = new Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  wifiName: { type: String, default: null },
  wifiPassword: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError if the model is already compiled
const Wifi = mongoose.models.Wifi || mongoose.model("Wifi", wifiSchema);

export default Wifi;
