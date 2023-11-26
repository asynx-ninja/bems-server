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

const MunicipalityOfficialsSchema = new Schema({
    picture: {
      type: FileSchema,
    },
    firstName: {
      type: String,
      default: "",
    },
    middleName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    suffix: {
      type: String,
      default: "",
    },
    details:{
      type: String,
    },
    position: {
      type: String,
    },
    fromYear: {
      type: Date,
    },
    toYear: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
  });

module.exports = mongoose.model("municipality_Official", MunicipalityOfficialsSchema);
