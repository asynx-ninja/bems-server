const express = require("express");
const router = express.Router();

const {
  GetBrgyService,
  GetBrgyServiceBanner,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
} = require("../controllers/ServicesController");

const upload = require("../config/Multer");

router.get("/", GetBrgyService);
router.get("/banner/:brgy", GetBrgyServiceBanner);
router.post("/", upload.array("files", 10), CreateServices);
router.patch("/:id", upload.array("files", 10), UpdateServices);
router.patch("/status/:id", StatusService);
router.patch("/archived/:id/:archived", ArchiveService);

module.exports = router;
