const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetBarangayAnnouncement,
  SearchBarangayAnnouncement,
  GetAllOpenBrgyAnnouncement,
  CreateAnnouncement,
  UpdateAnnouncement,
  ArchiveAnnouncement,
  GetBrgyAnnouncementBanner,
  UpdateAttendees,
  GetSpecificBarangayAnnouncement,
  getAllEvents,
} = require("../controllers/AnnouncementsController");

router.get("/", GetBarangayAnnouncement);
router.get("/search", SearchBarangayAnnouncement);
router.get("/all", GetAllOpenBrgyAnnouncement);
router.get("/specific", GetSpecificBarangayAnnouncement);
router.get("/get_distinct_events", getAllEvents);
router.get("/banner/:brgy", GetBrgyAnnouncementBanner);
router.post("/", upload.array("files", 10), CreateAnnouncement);
router.patch("/:id", upload.array("files", 10), UpdateAnnouncement);
router.patch("/attendees/:id", UpdateAttendees);
router.patch("/archived/:id/:archived", ArchiveAnnouncement);

module.exports = router;
