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
      required: true,
    },
    firstName: {
      type: String,
      default: "",
      required: true,
    },
    middleName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
      required: true,
    },
    suffix: {
      type: String,
      default: "",
    },
    details:{
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    fromYear: {
      type: Date,
      required: true,
    },
    toYear: {
      type: Date,
      required: true,
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

module.exports = mongoose.model("m_officials", MunicipalityOfficialsSchema);
