const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DocumentSchema = new Schema(
  {
    doc_title: {
      type: String,
      required: true,
      index: true,
    },
    version_id: {
      type: String,
      required: true,
      index: true,
    },
    form_id: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    punong_brgy: {
      type: String,
      required: true,
    },
    witnessed_by: {
      type: String,
      required: true,
    },
    inputs: {
      type: [String],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
    },
    brgy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("document", DocumentSchema);
