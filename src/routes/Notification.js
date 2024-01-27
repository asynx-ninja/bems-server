const express = require("express");
const router = express.Router();

const {
  GetAllNotifications,
  CreateNotificationByUser,
  UpdateReadBy,
  CheckReadBy
} = require("../controllers/NotificationsController");

// const upload = require("../config/Multer");

router.get("/", GetAllNotifications);
router.get("/check", CheckReadBy);
router.post("/", CreateNotificationByUser);
router.patch("/", UpdateReadBy);

module.exports = router;
