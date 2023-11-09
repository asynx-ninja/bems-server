const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FileSchema = new Schema(
  {
    link: String,
    id: String,
    name: String,
  },
  { _id: false }
);

const OfficialsSchema = new Schema(
  {
    picture: {
      type: FileSchema,
    },
    name: {
      type: String,
      uppercase: true,
    },
    position: {
      type: String,
      uppercase: true,
    },
    fromYear: {
      type: Date,
    },
    toYear: { 
      type: Date 
    },
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
      type: FileSchema,
      required: true,
    },
    logo: {
      type: FileSchema,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrgyInfo", BrgyInfoSchema);
