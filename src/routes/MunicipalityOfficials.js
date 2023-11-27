const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetMunicipalityOfficial,
  AddMunicipalityOfficial,
  UpdateMunicipalityOfficial,
  ArchiveOfficial,
} = require("../controllers/MunicipalityOffcialsController");

router.get("/", GetMunicipalityOfficial);
router.post("/", upload.single("file"), AddMunicipalityOfficial);
router.patch("/", upload.single("file"), UpdateMunicipalityOfficial);
router.patch("/archived/:id/:archived", ArchiveOfficial);

module.exports = router;
