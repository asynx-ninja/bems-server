const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OfficialsSchema = new Schema(
  {
    picture: String,
    name: String,
    position: String,
    fromYear: String,
    toYear: String,
  },
  { _id: false }
);

const BrgyInfoSchema = new Schema(
  {
    story: {
      type: String,
      required: true,
      index: true,
    },
    mission: {
      type: String,
      required: true,
      index: true,
    },
    vision: {
      type: String,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
    },
    officials: {
      type: [OfficialsSchema],
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    banner: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrgyInfo", BrgyInfoSchema);
