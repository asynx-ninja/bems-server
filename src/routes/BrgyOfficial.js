const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");
const { GetBarangayOfficial, AddBarangayOfficial, UpdateBarangayOfficial, } = require("../controllers/BrgyOfficalController");

router.get("/", GetBarangayOfficial);
router.post("/", upload.single("file"), AddBarangayOfficial);
router.patch("/:doc_id", upload.single("file"), UpdateBarangayOfficial);
module.exports = router;