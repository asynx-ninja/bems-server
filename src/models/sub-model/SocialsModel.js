const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubSocialSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const SocialsSchema = new Schema(
  {
    facebook: {
      type: SubSocialSchema,
    },
    instagram: {
      type: SubSocialSchema,
    },
    twitter: {
      type: SubSocialSchema,
    },
  },
  { _id: false }
);

module.exports = mongoose.model("Socials", SocialsSchema);
