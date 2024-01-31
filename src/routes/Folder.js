const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetAllBrgyFolders,
  GetSpecificBrgyFolders,
  CreateBrgyFolders,
} = require("../controllers/FolderController");

router.get("/", GetAllBrgyFolders);
router.get("/specific", GetSpecificBrgyFolders);
router.post("/", CreateBrgyFolders);

module.exports = router;
