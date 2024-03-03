const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FileSchema = new Schema(
  {
    link: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ResponseSchema = new Schema(
  {
    sender: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Admin", "Staff", "Resident"],
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
    },
    file: {
      type: [FileSchema],
    },
  },
  { _id: false }
);

const InquiriesSchema = new Schema(
  {
    inq_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    compose: {
      subject: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["Admin", "Staff", "Resident"],
      },
      message: {
        type: String,
        default: "",
      },
      date: {
        type: Date,
      },
      file: {
        type: [FileSchema],
      },
      to: {
        type: String,
        enum: ["Admin", "Staff", "Resident"],
      },
    },
    response: {
      type: [ResponseSchema],
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
    },
    folder_id: {
      type: String,
      required: true,
    },
    isApproved: {
      type: String,
      enum: ["Completed", "In Progress", "Pending"],
      default: "Pending",
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      default: "",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("inquiries", InquiriesSchema);
