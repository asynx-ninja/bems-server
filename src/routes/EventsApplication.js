const express = require("express");
const router = express.Router();

const {
  GetAllEventsApplication,
  GetEventsApplicationByUser,
  CreateEventsApplication,
  RespondToEventsApplication,
  ArchiveEventsApplication,
  CountCompleted,
  GetAllPenApp,
  GetCountPenApp
} = require("../controllers/EventsApplicationController");

const upload = require("../config/Multer");

router.get("/specific/", GetEventsApplicationByUser);
router.get("/", GetAllEventsApplication);
router.get("/completed", CountCompleted)
router.get("/pendingevents", GetAllPenApp)
router.get("/countpendingevents", GetCountPenApp)
router.post("/", upload.array("files", 10), CreateEventsApplication);
router.patch("/", upload.array("files", 10), RespondToEventsApplication);
router.patch("/archived/:id/:archived", ArchiveEventsApplication);

module.exports = router;
