const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetAboutusInformation,
  GetAllAboutusInfo,
  AddAboutusInfo,
  UpdateAboutusInfo,
} = require("../controllers/MAboutusController");

router.get("/", GetAboutusInformation);
router.get("/allinfo", GetAllAboutusInfo);
router.post("/", upload.single("file"), AddAboutusInfo);
router.patch("/manage", upload.single("file"), UpdateAboutusInfo);

module.exports = router;
