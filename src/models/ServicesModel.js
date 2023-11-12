const mongoose = require("mongoose");

const FileSchema = require("./sub-model/FileModel").schema;

const Schema = mongoose.Schema;

const ServicesSchema = new Schema(
  {
    service_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "Healthcare",
        "Education",
        "Social Welfare",
        "Security and Safety",
        "Infrastructure",
        "Community",
        "Administrative",
        "Environmental",
      ],
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    collections: {
      folder_id: {
        type: String,
        required: true,
      },
      banner: {
        type: FileSchema,
        required: true,
      },
      logo: {
        type: FileSchema,
        required: true,
      },
      file: {
        type: [FileSchema],
      },
    },
    isApproved: {
      type: String,
      enum: ["Approved", "Disapproved", "Pending"],
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Services", ServicesSchema);
