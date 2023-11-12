const mongoose = require("mongoose");

const FormSchema = require("./sub-model/FormModel").schema;

const Schema = mongoose.Schema;

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
