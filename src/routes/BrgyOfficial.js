const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetBarangayOfficial,
  AddBarangayOfficial,
  UpdateBarangayOfficial,
  GetSpecificOfficial,
} = require("../controllers/BrgyOfficalController");

router.get("/", GetBarangayOfficial);
router.get("/official/:brgy/:id", GetSpecificOfficial);
router.post("/", upload.single("file"), AddBarangayOfficial);
router.patch("/official/:brgy/:id", upload.single("file"), UpdateBarangayOfficial);

module.exports = router;
