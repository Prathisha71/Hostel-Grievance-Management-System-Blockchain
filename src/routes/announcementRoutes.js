import express from "express";
import { addAnnouncement, editAnnouncement, deleteAnnouncement,viewAllAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

// @route POST /announcement/add
router.post("/add", addAnnouncement);

// @route PUT /announcement/edit/:id
router.put("/edit/:id", editAnnouncement);
router.get("/all", viewAllAnnouncements);
// @route DELETE /announcement/delete/:id
router.delete("/delete/:id", deleteAnnouncement);

export default router;
