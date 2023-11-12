const mongoose = require("mongoose");

const FileSchema = require("./sub-model/FileModel").schema;
const AttendeesSchema = require("./sub-model/AttendeesModel").schema;

const Schema = mongoose.Schema;

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
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcements", AnnouncementsSchema);
