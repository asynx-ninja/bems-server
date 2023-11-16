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

const FormSchema = new Schema(
  {
    structure: {
      type: [Schema.Types.Mixed],
    },
    version: {
      type: String,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { _id: false }
);

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
    form: {
      type: [FormSchema],
      required: true,
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
