import Announcement from "../models/Announcement.js";

// @desc Add a new announcement
// @route POST /announcement/add
export const addAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }
   console.log(title,body);
    const newAnnouncement = new Announcement({ title, body });
    await newAnnouncement.save();

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: newAnnouncement,
    });
  } catch (error) {
    console.error("Error adding announcement:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc View all announcements
// @route GET /announcement/all
export const viewAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      success: true,
      message: "Announcements fetched successfully",
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Edit an existing announcement
// @route PUT /announcement/edit/:id
export const editAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { title, body },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Error editing announcement:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Delete an announcement
// @route DELETE /announcement/delete/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
