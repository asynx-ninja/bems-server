const express = require("express");
const router = express.Router();

const {
  GetAllNotificationsByUser,
  CreateNotificationByUser,
} = require("../controllers/NotificationsController");

// const upload = require("../config/Multer");

router.get("/", GetAllNotificationsByUser);
router.post("/", CreateNotificationByUser);

module.exports = router;
