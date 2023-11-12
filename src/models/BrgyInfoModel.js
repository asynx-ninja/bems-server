const mongoose = require("mongoose");

const FileSchema = require("./sub-model/FileModel").schema;
const OfficialsSchema = require("./sub-model/OfficialsModel").schema;

const Schema = mongoose.Schema;

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
