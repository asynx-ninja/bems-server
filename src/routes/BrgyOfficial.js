const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetBarangayOfficial,
  GetBarangayChairman,
  AddBarangayOfficial,
  UpdateBarangayOfficial,
  ArchiveOfficial,
} = require("../controllers/BrgyOfficalController");

router.get("/", GetBarangayOfficial);
router.get("/chairman", GetBarangayChairman);
router.post("/", upload.single("file"), AddBarangayOfficial);
router.patch("/", upload.single("file"), UpdateBarangayOfficial);
router.patch("/archived/:id/:archived", ArchiveOfficial);

module.exports = router;
