const mongoose = require("mongoose");
const Notification = require("../models/NotificationModel");

const GetAllNotifications = async (req, res) => {
  try {
    const { user_id, area, type } = req.query;

    const result = await Notification.find({
      $or: [
        { category: "All" },
        {
          $and: [{ category: "Many" }, { "target.area": area }, { type: type }],
        },
        {
          $and: [{ "target.user_id": user_id }, { category: "One" }],
        },
       
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateNotificationByUser = async (req, res) => {
  try {
    const { category, compose, target, banner, logo, type } = req.body;

    const result = await Notification.create({
      category,
      compose,
      target,
      banner,
      type,
      logo,
    });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};
const GetSpecificID = async (req, res) => {
  try {
    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such notification" });
    }

    const result = await Notification.find({
      _id: id,
    });

    return !result
      ? res.status(400).json({ error: `No such notification` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};
const UpdateReadBy = async (req, res) => {
  try {
    const { notification_id } = req.query;
    const { readerId } = req.body;

    const notification = await Notification.findById(notification_id);

    if (!notification) {
      return res.status(400).json({ error: "Notification not found" });
    }

    const isUserRead = notification.read_by.some((item) => item.readerId === readerId);

    if (isUserRead) {
      return res.status(400).json({ error: "User has already read the notification" });
    }

    notification.read_by.push({ readerId });
    const result = await notification.save();

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CheckReadBy = async (req, res) => {
  try {
    const { user_id, notification_id } = req.query;

    const result = await Notification.findById(
      { _id: notification_id },
      {
        read_by: {
          $elemMatch: {
            readerId: user_id,
          },
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetAllNotifications,
  CreateNotificationByUser,
  GetSpecificID,
  UpdateReadBy,
  CheckReadBy,
};
