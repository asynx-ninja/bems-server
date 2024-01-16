const mongoose = require("mongoose");

const Inquiries = require("../models/InquiriesModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  uploadFileDrive,
  createFolder,
  deleteFileDrive,
} = require("../utils/Drive");

// RESIDENT ONLY
const GetInquiries = async (req, res) => {
  try {
    const { id, brgy, archived, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = { user_id: id, brgy, isArchived: archived };

    const totalInquiries = await Inquiries.countDocuments(query);

    const result = await Inquiries.find(query).skip(skip).limit(itemsPerPage);

    return !result
      ? res
          .status(400)
          .json({ error: `No such inquiries for Barangay ${brgy}` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalInquiries / itemsPerPage),
        });
  } catch (err) {
    res.send(err.message);
  }
};

const GetAdminInquiries = async (req, res) => {
  try {
    const { to, archived, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const result = await Inquiries.find({
      $and: [
        { "compose.to": to }, // Convert to lowercase for case-insensitive comparison
        { isArchived: archived },
      ],
    })
      .skip(skip)
      .limit(itemsPerPage);

    const totalInquiries = await Inquiries.countDocuments({
      $and: [
        { "compose.to": to }, // Convert to lowercase for case-insensitive comparison
        { isArchived: archived },
      ],
    });

    const pageCount = Math.ceil(totalInquiries / itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such Announcement for ${to}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};

const GetStaffInquiries = async (req, res) => {
  try {
    const { to, brgy, archived, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      $and: [
        { brgy: brgy },
        { "compose.to": to }, // Convert to lowercase for case-insensitive comparison
        { isArchived: archived },
      ],
    };

    const totalInquiries = await Inquiries.countDocuments(query);

    const result = await Inquiries.find(query).skip(skip).limit(itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such Announcement for ${brgy}` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalInquiries / itemsPerPage),
        });
  } catch (err) {
    res.send(err.message);
  }
};

const CreateInquiries = async (req, res) => {
  try {
    const { body, files } = req;
    const { name, email, compose, brgy, user_id } = JSON.parse(body.inquiries);

    let fileArray = [];
    const inq_id = GenerateID(brgy, "Q");
    const folder_id = await createFolder(ReturnBrgyFormat(brgy), "Q", inq_id);

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFileDrive(files[f], folder_id);

      fileArray.push({
        link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
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
        type: compose.type || "",
        message: compose.message || "",
        date: new Date(),
        file: fileArray,
        to: compose.to || "",
      },
      brgy,
      folder_id,
      isApproved: "Pending",
      isArchived: false,
      user_id,
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
      return res.status(400).json({ error: "No such inquiry" });
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
    const { sender, type, message, date, folder_id } = response;

    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f++) {
        const { id, name } = await uploadFileDrive(files[f], folder_id);

        fileArray.push({
          link: files[f].mimetype.includes("image")
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
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
            type: type,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such inquiry" });
    }

    const result = await Inquiries.findOneAndUpdate(
      { _id: id },
      { $set: { isApproved: "Completed" } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetInquiries,
  GetAdminInquiries,
  GetStaffInquiries,
  ArchiveInquiry,
  CreateInquiries,
  RespondToInquiry,
  StatusInquiry,
};
