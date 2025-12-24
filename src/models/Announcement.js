import mongoose from "mongoose";

const { Schema } = mongoose;

const annSchema = new Schema({
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model("Announcement", annSchema);

export default Announcement;
