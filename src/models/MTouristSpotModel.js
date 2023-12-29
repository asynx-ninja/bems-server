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

const TouristSpotSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
      index: true,
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
    image: {
      type: [FileSchema],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("M_TouristSpot_Info", TouristSpotSchema);