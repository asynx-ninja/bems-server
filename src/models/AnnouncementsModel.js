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

const AttendeesSchema = new Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
    },
    contact: {
      type: String,
      default: "",
    },
    brgy: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const AnnouncementsSchema = new Schema(
  {
    event_id: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
    },
    collections: {
      folder_id: {
        type: String,
        required: true,
      },
      banner: {
        type: FileSchema,
        required: true,
      },
      logo: {
        type: FileSchema,
        required: true,
      },
      file: {
        type: [FileSchema],
      },
    },
    attendees: {
      type: [AttendeesSchema],
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("events", AnnouncementsSchema);
