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

const ResponseSchema = new Schema(
    {
        sender: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            enum: ["Admin", "Staff", "Resident"],
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
        name: {
            type: String,
            required: true,
            index: true,
        },
        to: {
            type: [String],
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
        user_id: {
            type: String,
            default: "",
            required: true,
          },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Patawag", PatawagSchema);