const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    sender: {
      type: String,
      default: "",
    },
    reference: {
      type: String,
      default: "",
    },
    proof: {
      type: String,
      default: "",
    },
    fee: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

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

const ResponseSchema = new Schema(
  {
    sender: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
    },
    file: {
      type: [FileSchema],
    },
  },
  { _id: false }
);

const RequestSchema = new Schema(
  {
    req_id: {
      type: String,
      required: true,
      index: true,
    },
    user_name: {
      type: String,
      required: true,
      index: true,
    },
    service_name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    payment: {
      type: [PaymentSchema],
    },
    status: {
      type: String,
      required: true,
    },
    file: {
      type: String,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    response: {
      type: [ResponseSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
