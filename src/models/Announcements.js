const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttendeesSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    contact: String,
    brgy: String,
  },
  { _id: false }
);

const FileSchema = new Schema(
  {
    link: String,
    id: String,
    name: String,
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
        type: [FileSchema],
        required: true,
      },
      logo: {
        type: [FileSchema],
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
    isArchived: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcements", AnnouncementsSchema);
