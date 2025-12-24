import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Google OAuth callback
export const googleCallback = async (req, res) => {
  try {
    const profile = req.user;
    console.log(profile); 
    const email = profile.emails?.[0]?.value;

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      let role = "student";
      if (email === "divya.p2023c@vitstudent.ac.in") role = "lowerAdmin";
      else if (email === "23f2001486@ds.study.iitm.ac.in") role = "higherAdmin";

      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        role,
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet: user.wallet || null,
    };

    // Redirect to frontend OAuth handler (same port)
    const redirectUrl = `/oauth-redirect?token=${token}&user=${encodeURIComponent(
      JSON.stringify(safeUser)
    )}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("googleCallback error", err);
    return res.redirect("/?error=auth_failed");
  }
};

// Wallet linking (student only)
export const linkWallet = async (req, res) => {
  try {
    const { token, walletAddress } = req.body;
    if (!token || !walletAddress) return res.status(400).json({ error: "Token and wallet required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.wallet = walletAddress;
    await user.save();

    return res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Invalid token or request" });
  }
};
