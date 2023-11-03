const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
    link: { type: String, default: "" },
    id: { type: String, default: "" },
    name: { type: String, default: "" },
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
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      required: true,
      index: true,
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    civil_status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Legally Separated"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Head Admin",
        "Admin",
        "Barangay Captain",
        "Barangay Kagawad",
        "Barangay Staff",
        "Resident",
      ],
      index: true,
      required: true,
    },
    isVoter: {
      type: Boolean,
      index: true,
      required: true,
    },
    isHead: {
      type: Boolean,
      index: true,
      required: true,
    },
    profile: {
      type: FileSchema,
      required: true,
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
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    pin: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
