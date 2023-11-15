const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");
const { GetBarangayInformation, AddBarangayInfo } = require("../controllers/BrgyInfoController");



router.get("/", GetBarangayInformation);
router.post("/", upload.array("files", 10), AddBarangayInfo);

module.exports = router;