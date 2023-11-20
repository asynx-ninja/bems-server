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
      required: true,
      default: false,
    },
  });

  module.exports = mongoose.model("Brgy_Official", OfficialsSchema);