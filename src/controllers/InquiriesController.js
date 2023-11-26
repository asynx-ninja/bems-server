const mongoose = require("mongoose");

const Inquiries = require("../models/InquiriesModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  uploadFileDrive,
  createFolder,
  deleteFileDrive,
} = require("../utils/Drive");

const GetInquiries = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await Inquiries.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return !result
      ? res
          .status(400)
          .json({ error: `No such Announcement for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateInquiries = async (req, res) => {
  try {
    const { body, files } = req;
    const { name, email, compose, brgy} = JSON.parse(body.inquiries);

    let fileArray = [];
    const inq_id = GenerateID(brgy, "Q");
    const folder_id = await createFolder(ReturnBrgyFormat(brgy), "Q", inq_id);

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFileDrive(files[f], folder_id);

      fileArray.push({
        link: `https://drive.google.com/uc?export=view&id=${id}`,
        id,
        name,
      });
    }

    const result = await Inquiries.create({
      inq_id,
      name,
      email,
      compose: {
        subject: compose.subject || "",
        message: compose.message || "",
        date: new Date(),
        file: fileArray,
        to: compose.to || "",
      },
      brgy,
      folder_id,
      isApproved: "Not Responded",
      isArchived: false,
      
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const ArchiveInquiry = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await Inquiries.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: archived } },
      { returnOriginal: false, upsert: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const RespondToInquiry = async (req, res) => {
  try {
    const { brgy, inq_id } = req.query;
    const { body, files } = req;
    console.log(body, files);
    const response = JSON.parse(body.response);
    const { sender, message, date, folder_id} = response;
   
    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f++) {
        const { id, name } = await uploadFileDrive(files[f], folder_id);

        fileArray.push({
          link: files[f].mimetype.includes("image")
            ? `https://drive.google.com/uc?export=view&id=${id}`
            : `https://drive.google.com/file/d/${id}/view`,
          id,
          name,
        });
      }
    }

    console.log(response);
    const result = await Inquiries.findByIdAndUpdate(
      { _id: inq_id },
      {
        $push: {
          response: {
            sender: sender,
            message: message,
            date: date,
            file: fileArray.length > 0 ? fileArray : null,
          },
        },
        $set: {
          isApproved: "In Progress",
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const StatusInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such Inquiry" });
    }

    const result = await Inquiries.findOneAndUpdate(
      { _id: id },
      { $set: { isApproved: isApproved} },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetInquiries,
  ArchiveInquiry,
  CreateInquiries,
  RespondToInquiry,
  StatusInquiry
};
