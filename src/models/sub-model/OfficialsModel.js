const mongoose = require("mongoose");

const FileSchema = require("./FileModel").schema;

const Schema = mongoose.Schema;

const OfficialsSchema = new Schema(
  {
    picture: {
      type: FileSchema,
    },
    name: {
      type: String,
      uppercase: true,
    },
    position: {
      type: String,
      uppercase: true,
    },
    fromYear: {
      type: Date,
    },
    toYear: {
      type: Date,
    },
  },
  { _id: false }
);

module.exports = mongoose.model("Officials", OfficialsSchema);
