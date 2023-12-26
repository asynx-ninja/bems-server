const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["All", "One", "Many"],
    },
    sender: {
      type: String,
      default: "",
    },
    receiver: [
      {
        type: String,
        default: "",
      },
    ],
    message: {
      type: String,
      default: "",
    },
    read_by: [
      {
        readerId: {
          type: String,
          default: "",
        },
        read_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", NotificationSchema);
