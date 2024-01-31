const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FolderSchema = new Schema(
  {
    root: {
      type: String,
      required: true,
      index: true,
    },
    events: {
      type: String,
      required: true,
      index: true,
    },
    request: {
      type: String,
      required: true,
      index: true,
    },
    service: {
      type: String,
      required: true,
      index: true,
    },
    pfp: {
      type: String,
      required: true,
      index: true,
    },
    official: {
      type: String,
      required: true,
      index: true,
    },
    info: {
      type: String,
      required: true,
      index: true,
    },
    inquiries: {
      type: String,
      required: true,
      index: true,
    },
    brgy: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("folders", FolderSchema);
