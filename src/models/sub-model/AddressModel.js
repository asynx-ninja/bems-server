const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AddressSchema = new Schema(
  {
    street: {
      type: String,
      uppercase: true,
      required: true,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    city: {
      type: String,
      uppercase: true,
      required: true,
    },
  },
  { _id: false }
);

module.exports = mongoose.model("Address", AddressSchema);
