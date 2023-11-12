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

module.exports = mongoose.model("Payment", PaymentSchema);
