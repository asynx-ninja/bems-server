const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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

const OfficialsSchema = new Schema({
  picture: {
    type: FileSchema,
  },
  name: {
    type: String,
  },
  position: {
    type: String,
  },
  fromYear: {
    type: Date,
  },
  toYear: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
    required: true,
  },
   brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
});

module.exports = mongoose.model("Brgy_Official", OfficialsSchema);
