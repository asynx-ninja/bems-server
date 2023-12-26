const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetInquiries,
  GetAdminInquiries,
  GetStaffInquiries,
  CreateInquiries,
  ArchiveInquiry,
  RespondToInquiry,
  StatusInquiry,
} = require("../controllers/InquiriesController");

router.get("/", GetInquiries);
router.get("/admininquiries", GetAdminInquiries);
router.get("/staffinquiries", GetStaffInquiries);
router.post("/", upload.array("files", 10), CreateInquiries);
router.patch("/", upload.array("files", 10), RespondToInquiry);
router.patch("/archived/:id", ArchiveInquiry);
router.patch("/status/:id", StatusInquiry);

module.exports = router;
