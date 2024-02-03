const express = require("express");
const router = express.Router();

const {
  GetAllNotifications,
  CreateNotificationByUser,
  GetSpecificID,
  UpdateReadBy,
  CheckReadBy
} = require("../controllers/NotificationsController");

// const upload = require("../config/Multer");

router.get("/", GetAllNotifications);
router.get("/check", CheckReadBy);
router.get("/get_id", GetSpecificID);
router.post("/", CreateNotificationByUser);
router.patch("/", UpdateReadBy);

module.exports = router;
