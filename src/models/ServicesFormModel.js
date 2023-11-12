const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FormSchema = new Schema(
  {
    form: {
      type: [Schema.Types.Mixed],
    },
    version: {
      type: Number,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicesForm", ServicesFormSchema);
