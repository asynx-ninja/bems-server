const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    sender: {
      type: String,
      default: "",
    },
    reference: {
      type: String,
      default: "",
    },
    proof: {
      type: String,
      default: "",
    },
    fee: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

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

const ResponseSchema = new Schema(
  {
    sender: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: new Date(),
    },
    file: {
      type: [FileSchema],
    },
    isRepliable: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const EventsApplicationSchema = new Schema(
  {
    eventApplication_id: {
      type: String,
      required: true,
    },
    event_id: {
      type: String,
      required: true,
      index: true,
    },
    event_name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    form: {
      type: Schema.Types.Mixed,
    },
    file: {
      type: [FileSchema],
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    payment: {
      type: PaymentSchema,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Paid",
        "Processing",
        "Cancelled",
        "Transaction Completed",
        "Rejected",
      ],
      default: "Pending",
      index: true,
    },
    response: {
      type: [ResponseSchema],
    },
    version: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    folder_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventsApplication", EventsApplicationSchema);
