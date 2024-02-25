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
    const { id, brgy, archived, to, inq_id, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = { user_id: id, brgy, isArchived: archived };

    const totalInquiries = await Inquiries.countDocuments(query);

    let totalEventsApplications = 0

    let result = []

    if (to === "all" && inq_id === undefined) {
      totalEventsApplications = await Inquiries.countDocuments({
        "user_id": id,
      });

      result = await Inquiries.find({
        "user_id": id,
      })
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 });

    } else if (inq_id) {
      totalEventsApplications = await Inquiries.countDocuments({
        "inq_id": inq_id,
      });


      result = await Inquiries.find({
        "inq_id": inq_id,
      })
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 });
    } else {
      totalEventsApplications = await Inquiries.countDocuments({
        "compose.to": to,
      });

      result = await Inquiries.find({
        "compose.to": to,
      })
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 });
    }

    const all = await Inquiries.find({
      "user_id": id,
    })

    return !result
      ? res
        .status(400)
        .json({ error: `No such inquiries for Barangay ${brgy}` })
      : res.status(200).json({
        result,
        all,
        pageCount: Math.ceil(totalInquiries / itemsPerPage),
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
    const { to, archived, page, status } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      "compose.to": to,
      isArchived: archived,
    };

    if (status && status.toLowerCase() !== "all") {
      query.isApproved = status;
    }
    const totalInquiries = await Inquiries.countDocuments(query);
    const result = await Inquiries.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such Announcement for ${to}` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalInquiries / itemsPerPage),
          total: totalInquiries,
        });
  } catch (err) {
    res.send(err.message);
  }
};

const GetStaffInquiries = async (req, res) => {
  try {
    const { brgy, archived, status, page, label } = req.query;
    const itemsPerPage = 10;
    const skip = (parseInt(page) || 0) * itemsPerPage;
    console.log(skip)
    const query = {
      brgy,
      isArchived: archived,
      "compose.to": label
    };

    if (status && status.toLowerCase() !== "all") {
      query.isApproved = status;
    }

    const totalInquiries = await Inquiries.countDocuments(query);
  
    const result = await Inquiries.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });
      
    return !result
      ? res
        .status(400)
        .json({ error: `No such inquiries for Barangay ${brgy}` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalInquiries / itemsPerPage),
          total: totalInquiries
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
    console.log(body, files);
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
