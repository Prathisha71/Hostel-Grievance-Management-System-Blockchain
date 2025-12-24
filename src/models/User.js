import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: { type: String, index: true },
  name: String,
  email: String,
  role: { type: String, enum: ["student", "lowerAdmin", "higherAdmin"], default: "student" },
  wallet: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

export default User;
