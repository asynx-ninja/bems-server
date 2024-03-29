const express = require("express");
const router = express.Router();

const {
  GetBrgyAdmin,
  GetSpecificBrgyAdmin,
  GetArchivedBrgyAdmin,
  CreateBrgyAdmin,
  UpdateBrgyAdmin,
  ArchiveBrgyAdmin,
} = require("../controllers/BrgyAdminController");

const upload = require("../config/Multer");

router.get("/", GetBrgyAdmin);
router.get("/specific/:id", GetSpecificBrgyAdmin);
router.get("/showArchivedAdmin/", GetArchivedBrgyAdmin);
router.post("/", CreateBrgyAdmin);
router.patch("/", upload.single("file"), UpdateBrgyAdmin);
router.patch("/archived/:id/:archived", ArchiveBrgyAdmin);

module.exports = router;
