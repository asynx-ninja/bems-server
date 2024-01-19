const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// SUB SCHEMA
const AddressSchema = new Schema(
  {
    street: {
      type: String,
      uppercase: true,
      required: true,
    },
    brgy: {
      type: String,
      uppercase: true,
      required: true,
      index: true,
    },
    city: {
      type: String,
      uppercase: true,
      required: true,
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

const SocialsSchema = new Schema(
  {
    facebook: {
      link: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "",
      },
    },
    instagram: {
      link: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "",
      },
    },
    twitter: {
      link: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "",
      },
    },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    middleName: {
      type: String,
      uppercase: true,
    },
    lastName: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    suffix: {
      type: String,
    },
    religion: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      enum: ["Male", "Female"],
      index: true,
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    occupation: {
      type: String,
      default: "",
    },
    civil_status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Legally Separated"],
    },
    type: {
      type: String,
      enum: ["Head Admin", "Admin", "Brgy Admin", "Staff", "Resident"],
      index: true,
      required: true,
    },
    isVoter: {
      type: Boolean,
      index: true,
    },
    isHead: {
      type: Boolean,
      index: true,
    },
    profile: {
      type: FileSchema,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    isApproved: {
      type: String,
      enum: ["Registered", "Denied", "Pending"],
      index: true,
      default: "Pending",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    pin: {
      type: String,
      default: "",
    },
    socials: {
      type: SocialsSchema,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", UserSchema);
