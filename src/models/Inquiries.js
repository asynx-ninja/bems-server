const mongoose = require("mongoose");

const ResponseSchema = require("./sub-model/ResponseModel").schema;

const Schema = mongoose.Schema;

const InquiriesSchema = new Schema(
  {
    inq_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: [ResponseSchema],
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiries", InquiriesSchema);
