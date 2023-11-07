const express = require("express");
const router = express.Router();

const {
  GetBrgyService,
  GetBrgyServiceBanner,
  GetArchivedBrgyService,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
  UnArchiveService,
} = require("../controllers/ServicesController");

const upload = require("../config/Multer");

router.get("/", GetBrgyService);
router.get("/banner/:brgy", GetBrgyServiceBanner);
router.get("/showArchived/:brgy", GetArchivedBrgyService);
router.post("/", upload.array("files", 10), CreateServices);
router.patch("/:id", upload.array("files", 10), UpdateServices);
router.patch("/status/:id", StatusService);
router.patch("/archived/:id", ArchiveService);
router.patch("/unarchived/:id", UnArchiveService);

module.exports = router;
