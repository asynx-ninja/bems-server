const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
  GetTouristSpotInformation,
  GetSpecificTouristInfo,
  AddTouristSpotInfo,
  UpdateTouristSpotInfo,
  ArchiveTouristSpot,
} = require("../controllers/MTouristSpotController");

router.get("/", GetTouristSpotInformation);
router.get("/tourist_info/:id", GetSpecificTouristInfo);
router.post("/", upload.array("files", 10), AddTouristSpotInfo);
router.patch("/:id", upload.array("files", 10), UpdateTouristSpotInfo);
router.patch("/archived/:id/:archived", ArchiveTouristSpot);

module.exports = router;