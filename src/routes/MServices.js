const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetServicesInformation,
  AddServicesInfo,
  UpdateServicesInfo,
  ArchiveServicesInfo,
} = require("../controllers/MServicesController");

router.get("/", GetServicesInformation);
router.post("/", upload.array("files", 10), AddServicesInfo);
router.patch("/manage", upload.single("file"), UpdateServicesInfo);
router.patch("/archived/:id/:archived", ArchiveServicesInfo);

module.exports = router;
