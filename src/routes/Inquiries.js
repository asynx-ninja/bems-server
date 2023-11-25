const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetInquiries,
  CreateInquiries,
  ArchiveInquiry,
  RespondToInquiry,
} = require("../controllers/InquiriesController");

router.get("/", GetInquiries);
router.post("/", upload.array("files", 10), CreateInquiries);
router.patch("/", upload.array("files", 10), RespondToInquiry);
router.patch("/archived/:id/:archived", ArchiveInquiry);

module.exports = router;
