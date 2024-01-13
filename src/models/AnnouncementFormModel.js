const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AnnouncementFormSchema = new Schema(
  {
    event_id: {
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

module.exports = mongoose.model("event_forms", AnnouncementFormSchema);
