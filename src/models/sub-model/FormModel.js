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

module.exports = mongoose.model("Form", FormSchema);
