const mongoose = require("mongoose");

const Inquiries = require("../models/InquiriesModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

// RESIDENT ONLY
const GetInquiries = async (req, res) => {
  try {
    const { id, brgy, archived, to } = req.query;

    let query = {
      $and: [{ isArchived: archived }, { user_id: id }, { brgy: brgy }],
    };

    if(to && to.toLowerCase() !== "all"){
      query.$and.push({ "compose.to": to });
    }

    const result = await Inquiries.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.send(err.message);
  }
};
// Backend API endpoint to get the number of inquiries in each status for every barangay
const GetInquiriesStatus = async (req, res) => {
  try {
    const barangays = [
      "BALITE",
      "BURGOS",
      "GERONIMO",
      "MACABUD",
      "MANGGAHAN",
      "MASCAP",
      "PURAY",
      "ROSARIO",
      "SAN ISIDRO",
      "SAN JOSE",
      "SAN RAFAEL",
    ];

    const inquiriesByStatusAndBarangay = await Inquiries.aggregate([
      {
        $match: {
          brgy: { $in: barangays },
        },
      },
      {
        $group: {
          _id: {
            status: "$isApproved",
            barangay: "$brgy",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id.status",
          barangay: "$_id.barangay",
          count: 1,
        },
      },
    ]);

    res.json(inquiriesByStatusAndBarangay);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const GetAdminInquiries = async (req, res) => {
  try {
    const { to, archived, status } = req.query;

    const matchQuery = {
      "compose.to": to,
      isArchived: archived === 'true', // Convert to boolean
    };

    if (status && status.toLowerCase() !== "all") {
      matchQuery.isApproved = status;
    }

    const result = await Inquiries.aggregate([
      { $match: matchQuery },
      { $unwind: { path: "$response", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          inq_id: { $first: "$inq_id" },
          name: { $first: "$name" },
          email: { $first: "$email" },
          compose: { $first: "$compose" },
          response: { $push: "$response" },
          brgy: { $first: "$brgy" },
          isArchived: { $first: "$isArchived" },
          folder_id: { $first: "$folder_id" },
          isApproved: { $first: "$isApproved" },
          user_id: { $first: "$user_id" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          latestResponseDate: { $max: "$response.date" }
        },
      },
      {
        $addFields: {
          mostRecentDate: {
            $cond: {
              if: { $gt: ["$latestResponseDate", "$createdAt"] },
              then: "$latestResponseDate",
              else: "$createdAt",
            },
          },
        },
      },
      { $sort: { mostRecentDate: -1 } },
    ]);

    return result.length === 0
      ? res.status(400).json({ error: `No such Announcement for ${to}` })
      : res.status(200).json({
        result,
        pageCount: Math.ceil(result.length / 10),
        total: result.length,
      });
  } catch (err) {
    res.send(err.message);
  }
};

// const GetAdminInquiries = async (req, res) => {
//   try {
//     const { to, archived, status } = req.query;

//     const query = {
//       "compose.to": to,
//       isArchived: archived,
//     };

//     if (status && status.toLowerCase() !== "all") {
//       query.isApproved = status;
//     }

//     const result = await Inquiries.find(query).sort({ createdAt: -1 });

//     return !result
//       ? res.status(400).json({ error: `No such Announcement for ${to}` })
//       : res.status(200).json({
//         result,
//         pageCount: Math.ceil(result.length / 10),
//         total: result.length,
//       });
//   } catch (err) {
//     res.send(err.message);
//   }
// };


const GetStaffInquiries = async (req, res) => {
  try {
    const { brgy, archived, status, label } = req.query;


    const query = {
      brgy,
      isArchived: archived,
      "compose.to": label
    };

    if (status && status.toLowerCase() !== "all") {
      query.isApproved = status;
    }

    const totalInquiries = await Inquiries.countDocuments(query);

    const result = await Inquiries.find(query).sort({ createdAt: -1 });


    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.send(err.message);
  }
};

const CreateInquiries = async (req, res) => {
  try {
    const { inq_folder_id } = req.query;
    const { body, files } = req;
    const { name, email, compose, brgy, user_id } = JSON.parse(body.inquiries);

    let fileArray = [];
    const inq_id = GenerateID("", brgy, "Q");
    const folder_id = await createRequiredFolders(inq_id, inq_folder_id);

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFolderFiles(files[f], folder_id);

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

    const response = JSON.parse(body.response);
    const { sender, type, message, date, folder_id, status } = response;

    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f++) {
        const { id, name } = await uploadFolderFiles(files[f], folder_id);

        fileArray.push({
          link: files[f].mimetype.includes("image")
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
            : `https://drive.google.com/file/d/${id}/view`,
          id,
          name,
        });
      }
    }

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
          isApproved: status,
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

const getTotalStatusInquiries = async (req, res) => {
  try {
    // Update the matchCondition for "In Progress", "Pending", and "Completed"
    let matchCondition = {
      isApproved: { $in: ["In Progress", "Pending", "Completed"] },
    };

    // Extract query parameters
    const { brgy } = req.query;

    console.log("brgy:", brgy);

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    console.log("matchCondition:", matchCondition);

    const serviceSummary = await Inquiries.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$isApproved",
          totalRequests: { $sum: 1 },
        },
      },
    ]);

    console.log("serviceSummary:", serviceSummary);

    res.json(serviceSummary);
  } catch (error) {
    console.error("Error in getTotalStatusRequests:", error);
    res.status(500).send(error);
  }
};

module.exports = {
  GetInquiries,
  GetInquiriesStatus,
  GetAdminInquiries,
  GetStaffInquiries,
  ArchiveInquiry,
  CreateInquiries,
  RespondToInquiry,
  StatusInquiry,
  getTotalStatusInquiries,
};