const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetInquiries,
  GetInquiriesStatus,
  GetAdminInquiries,
  GetStaffInquiries,
  CreateInquiries,
  ArchiveInquiry,
  RespondToInquiry,
  StatusInquiry,
  getTotalStatusInquiries,
  GetAllPenStaffInq,
} = require("../controllers/InquiriesController");

router.get("/", GetInquiries);
router.get("/inquiries_percent", GetInquiriesStatus);
router.get("/admininquiries", GetAdminInquiries);
router.get("/staffinquiries", GetStaffInquiries);
router.get("/all_status_inquiries", getTotalStatusInquiries);
router.post("/", upload.array("files", 10), CreateInquiries);
router.patch("/", upload.array("files", 10), RespondToInquiry);
router.patch("/archived/:id/:archived", ArchiveInquiry);
router.patch("/status/:id", StatusInquiry);

module.exports = router;
