const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttendeesSchema = new Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
    },
    contact: {
      type: String,
      default: "",
    },
    brgy: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

module.exports = mongoose.model("Attendees", AttendeesSchema);
