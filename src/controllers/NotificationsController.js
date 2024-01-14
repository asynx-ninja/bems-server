const mongoose = require("mongoose");
const Notification = require("../models/NotificationModel");

const GetAllNotificationsByUser = async (req, res) => {
  try {
    const { user_type, brgy } = req.query;

    const result = await Notification.find({ "compose.receiver": user_type });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateNotificationByUser = async (req, res) => {
  try {
    const { category, compose, banner, logo } = req.body;

    if (
      !(
        mongoose.Types.ObjectId.isValid(compose.receiver) ||
        compose.receiver === "Admin" ||
        compose.receiver === "Staff"
      )
    ) {
      return res.status(400).json({ error: "compose.receiver is required" });
    }

    const result = await Notification.create({
      category,
      compose,
      banner,
      logo,
    });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetAllNotificationsByUser,
  CreateNotificationByUser,
};
