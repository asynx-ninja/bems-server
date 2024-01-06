const express = require("express");
const router = express.Router();

const {
  GetAllEventsForm,
  CreateEventsForm,
  UpdateEventsForm,
} = require("../controllers/AnnouncementFormController");

router.get("/", GetAllEventsForm);
router.post("/", CreateEventsForm);
router.patch("/", UpdateEventsForm);

module.exports = router;
