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

const ColorSchema = new Schema(
  {
    primary: {
      type: String,
      default: "#295141",
    },
    secondary: {
      type: String,
      default: "#268F26",
    },
    gradient: {
      type: {
        start: {
          type: String,
          required: true,
          default: "#295141"
        },
        end: {
          type: String,
          required: true,
          default: "#408D51"
        }
      },
    },
    hover: {
      type: String,
      default: "#D3B574"
    }
  },
  { _id: false }
);

const BrgyInfoSchema = new Schema(
  {
    story: {
      type: String,
      required: true,
      index: true,
    },
    mission: {
      type: String,
      required: true,
      index: true,
    },
    vision: {
      type: String,
      required: true,
      index: true,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    banner: {
      type: FileSchema,
      required: true,
    },
    logo: {
      type: FileSchema,
      required: true,
    },
    theme: {
      type: ColorSchema,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("brgy_info", BrgyInfoSchema);
