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
          $or: [{ "target.user_id": user_id }, { category: "One" }],
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
    const { category, compose, target, banner, logo } = req.body;

    const result = await Notification.create({
      category,
      compose,
      target,
      banner,
      logo,
    });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UpdateReadBy = async (req, res) => {
  try {
    const { notification_id } = req.query;
    const { readerId } = req.body;

    const result = await Notification.findOneAndUpdate(
      { _id: notification_id },
      {
        $push: {
          read_by: {
            readerId: readerId,
          },
        },
      },
      { new: true }
    );

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
  UpdateReadBy,
  CheckReadBy,
};
