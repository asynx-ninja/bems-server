const mongoose = require("mongoose");

const FileSchema = require("./FileModel").schema;

const Schema = mongoose.Schema;

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

module.exports = mongoose.model("Response", ResponseSchema);
