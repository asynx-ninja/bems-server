const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
  },
  { _id: false }
);

const ServicesFormSchema = new Schema(
  {
    service_id: {
      type: String,
      required: true,
      index: true,
    },
    form: {
      type: [FormSchema],
      required: true,
    },
    brgy: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Services_Forms", ServicesFormSchema);
