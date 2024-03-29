const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetBarangayInformation,
  GetAllBarangay,
  AddBarangayInfo,
  UpdateBarangayInfo,
} = require("../controllers/BrgyInfoController");

router.get("/", GetBarangayInformation);
router.get("/allinfo", GetAllBarangay);
router.post("/", upload.array("files", 10), AddBarangayInfo);
router.patch("/:brgy", upload.array("files", 10), UpdateBarangayInfo);

module.exports = router;
