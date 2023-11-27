const express = require("express");
const router = express.Router();

const {
  GetBrgyAdmin,
  GetSpecificBrgyAdmin,
  GetArchivedBrgyAdmin,
  CreateBrgyAdmin,
  UpdateBrgyAdmin,
  ArchiveBrgyAdmin,
} = require("../controllers/AdminController");

const upload = require("../config/Multer");

router.get("/", GetBrgyAdmin);
router.get("/specific/:id", GetSpecificBrgyAdmin);
router.get("/showArchived/", GetArchivedBrgyAdmin);
router.post("/", CreateBrgyAdmin);
router.patch("/:doc_id", upload.single("file"), UpdateBrgyAdmin);
router.patch("/archived/:id/:archived", ArchiveBrgyAdmin);

module.exports = router;
