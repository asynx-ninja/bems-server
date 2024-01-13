// create events - resident all
// application update - resident one
// 		   - staff many

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
    receiver: {
      type: Schema.Types.Mixed,
      default: null,
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

const NotificationSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["All", "One", "Many"],
    },
    compose: {
      type: MessageSchema,
    },
    read_by: [
      {
        readerId: {
          default: "",
          type: mongoose.Types.ObjectId,
        },
        read_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    banner: {
      type: FileSchema,
      required: true,
    },
    logo: {
      type: FileSchema,
      required: true,
    },
    brgy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", NotificationSchema);
