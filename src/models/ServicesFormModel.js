const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ServicesFormSchema = new Schema(
  {
    service_id: {
      type: String,
      requried: true,
      index: true,
    },
    form: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    version: {
      type: String,
      required: true,
      index: true,
    },
    brgy: {
      type: String,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("service_forms", ServicesFormSchema);
