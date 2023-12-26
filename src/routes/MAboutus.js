const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetAboutusInformation,
  AddAboutusInfo,
  UpdateAboutusInfo,
  ArchiveAboutus,
} = require("../controllers/MAboutusController");

router.get("/", GetAboutusInformation);
router.post("/", upload.single("file"), AddAboutusInfo);
router.patch("/manage", upload.single("file"), UpdateAboutusInfo);
router.patch("/archived/:id/:archived", ArchiveAboutus);

module.exports = router;
