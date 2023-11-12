const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");
const { GetBarangayInformation, AddBarangayOfficials } = require("../controllers/BrgyInfoController");



router.get("/", GetBarangayInformation);
router.post("/", upload.array("files", 10), AddBarangayOfficials);

module.exports = router;