const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResponseSchema = new Schema(
  {
    sender: String,
    message: String,
    date: Date,
    file: String,
  },
  { _id: false }
);

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
        type: [ResponseSchema]
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
