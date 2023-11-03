const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    sender: String,
    reference: String,
    proof: String,
    fee: Number,
  },
  { _id: false }
);

const ResponseSchema = new Schema(
  {
    sender: String,
    message: String,
    date: Date,
    file: String,
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
        type: [ResponseSchema]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
