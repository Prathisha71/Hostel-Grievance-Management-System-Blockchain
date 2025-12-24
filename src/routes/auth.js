import express from "express";
import passport from "passport";
import { googleCallback, linkWallet } from "../controllers/authController.js";

const router = express.Router();

// @desc Authenticate with Google
// @route GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc Google OAuth callback
// @route GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleCallback
);

// @desc Link wallet to user
// @route POST /auth/link-wallet
router.post("/link-wallet", linkWallet);

export default router;
