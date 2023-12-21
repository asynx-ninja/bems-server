const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetServicesInformation,
  GetAllServicesInfo,
  AddServicesInfo,
  UpdateServicesInfo,
} = require("../controllers/MServicesController");

router.get("/", GetServicesInformation);
router.get("/allinfo", GetAllServicesInfo);
router.post("/", upload.array("files", 10), AddServicesInfo);
router.patch("/:brgy", upload.array("files", 10), UpdateServicesInfo);

module.exports = router;
