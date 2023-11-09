const express = require("express");
const router = express.Router();

const {
  GetBarangayAnnouncement, CreateAnnouncement, UpdateAnnouncement, ArchiveAnnouncement, GetBrgyAnnouncementBanner, UpdateAttendees,
} = require("../controllers/AnnouncementsController");

const upload = require("../config/Multer");

router.get("/", GetBarangayAnnouncement);
router.get("/banner/:brgy", GetBrgyAnnouncementBanner);
router.post("/", upload.array("files", 10), CreateAnnouncement);
router.patch("/:id", upload.array("files", 10), UpdateAnnouncement);
router.patch("/attendees/:id", UpdateAttendees);
router.patch("/archived/:id/:archived", ArchiveAnnouncement);
module.exports = router;