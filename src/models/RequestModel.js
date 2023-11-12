const mongoose = require("mongoose");

const PaymentSchema = require("./sub-model/PaymentModel").schema;
const ResponseSchema = require("./sub-model/ResponseModel").schema;

const Schema = mongoose.Schema;

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
