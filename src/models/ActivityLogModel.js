const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ActivityLogs = new Schema(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },
    firstname: {
      type: String,
      required: true,
      index: true,
    },
    lastname: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["Created", "Deleted", "Updated", "Archived", "Restored"],
    },
    details: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
    brgy: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("activity_logs", ActivityLogs);
