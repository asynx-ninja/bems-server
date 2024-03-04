const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DocumentBlotterSchema = new Schema(
  {
    version_id: {
      type: String,
      required: true,
      index: true,
    },
    req_id: {
      type: String,
      required: true,
      index: true,
    },
    doc_title: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    usapin_blg: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    patawag: {
      type: String,
      required: true,
    },
    complainant: {
      type: String,
      required: true,
    },
    complainant_address: {
      type: String,
      required: true,
    },
    accused: {
      type: String,
      required: true,
    },
    accused_address: {
      type: String,
      required: true,
    },
    message: {
      type: [String],
      required: true,
    },
    bcpc_vawc: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    brgy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blotter_documents", DocumentBlotterSchema);
