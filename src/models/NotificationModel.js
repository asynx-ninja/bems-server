// create events - resident all if open for all / resident many if not open for all
// application create - staff many (including brgy admin)
// application update - resident one

// update service to registered - resident all
// service request - resident one
// 		- staff many

// create inquiry  - staff / admin many
// update inquiry	- resident one
// 		- staff / admin many

// when creating events - if it is open for all
// receiver: null
// category: all

// when creating events - barangay only
// receiver: resident from brgy
// category: many

// when applying an event,
// receiver: creator of the event (staff or admin),
// category: many

// update status on event application
// receiver: specific resident (id)
// category: one

// approving the service
// receiver: admin,
// category: many

// creating service request
// receiver: staff
// category: many

// update status on service request
// receiver: specific resident (id)
// category: one

// creating inquiry
// receiver: staff or admin
// category: many

// update status on inquiry
// receiver: specific resident (id)
// category: one

// the question?

// how to reflect it the resident, staff and admin?

// if residents
// - get all the following:
// = events that is all
// = events that is for their respective brgy
// = resident status event application (id)
// = resident status service request (id)
// = resident status inquiry (id)

// if staff
// - get all the following:
// = events that is all
// = events that is for their respective brgy
// = resident event applications
// = resident service requests
// = resident inquiries for staff only

// if admin
// - get all the following:
// - events that is all
// - events that is for municipality only
// - resident event applications
// - resident inquiries for admin only

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

const MessageSchema = new Schema(
  {
    subject: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    go_to: {
      type: String,
      default: "",
      enum: ["Events", "Application", "Services", "Requests", "Inquiries"],
    },
  },
  { _id: false }
);

const ReadBySchema = new Schema(
  {
    readerId: {
      default: "",
      type: String,
      required: true,
    },
    read_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false }
);

const TargetSchema = new Schema(
  {
    user_id: {
      type: String,
      default: null,
    },
    area: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const NotificationSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["All", "One", "Many"],
      required: true,
    },
    compose: {
      type: MessageSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ["Municipality", "Barangay", "Resident"],
      default: "",
    },
    target: { type: TargetSchema, required: true },
    read_by: { type: [ReadBySchema], required: true },
    banner: {
      type: FileSchema,
      required: true,
    },
    logo: {
      type: FileSchema,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", NotificationSchema);
