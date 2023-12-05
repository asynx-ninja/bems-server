const express = require("express");
const router = express.Router();

const {
  GetBrgyStaffs,
  GetSpecificBrgyStaff,
  GetArchivedStaffs,
  CreateBrgyStaff,
  UpdateBrgyStaff,
  ArchiveStaff,
} = require("../controllers/StaffController");

const upload = require("../config/Multer");

router.get("/:brgy", GetBrgyStaffs);
router.get("/specific/:id", GetSpecificBrgyStaff);
router.get("/showArchived/:brgy", GetArchivedStaffs);
router.post("/", CreateBrgyStaff);
router.patch("/:doc_id", upload.single("file"), UpdateBrgyStaff);
router.patch("/archived/:id/:archived", ArchiveStaff);

module.exports = router;
