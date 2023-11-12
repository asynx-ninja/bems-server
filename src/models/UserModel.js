const mongoose = require("mongoose");

const AddressSchema = require("./sub-model/AddressModel").schema;
const FileSchema = require("./sub-model/FileModel").schema;
const SocialsSchema = require("./sub-model/SocialsModel").schema;

const Schema = mongoose.Schema;

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
      enum: ["Admin", "Staff", "Resident"],
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
      default: "",
    },
    socials: {
      type: SocialsSchema
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
