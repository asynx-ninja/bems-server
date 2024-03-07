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

const receiverSchema = new Schema(
    {
        lastName: {
            type: String,
            default: "",
        },
        firstName: {
            type: String,
            default: "",
        },
        middleName: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            enum: ["Complainant", "Defendant"]
        }
    }
)

const ResponseSchema = new Schema(
    {
      sender: {
        type: String,
        default: "",
      },
      type: {
        type: String,
        enum: ["Complainant", "Staff", "Defendant"],
      },
      message: {
        type: String,
        default: "",
      },
      date: {
        type: Date,
      },
      file: {
        type: [FileSchema],
      },
    },
    { _id: false }
  );

const PatawagSchema = new Schema(
    {
        patawag_id: {
            type: String,
            required: true,
            index: true,
        },
        req_id: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            index: true,
        },
        to: {
            type: [receiverSchema],
            default: [],
        },
        brgy: {
            type: String,
            uppercase: true,
            required: true,
            index: true,
        },
        responses: {
            type: [ResponseSchema],
            default: [],
        },
        req_id: {
            type: String,
            required: true,
            index: true,
          },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Patawag", PatawagSchema);