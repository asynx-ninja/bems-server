const mongoose = require("mongoose");
const ActivityLogs = require("../models/ActivityLogModel");
const User = require("../models/UserModel");
const GetActivityLog = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await ActivityLogs.find({ brgy: brgy }).sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 15),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddActLog = async (req, res) => {
    try {
      const { id } = req.query;
      const { action, details, ip } = req.body; // No need to parse since it's already JSON
  
      const userRecord = await User.findOne({ _id: id });
      const { firstName, lastName, type, address, profile } = userRecord;
  
      // Extract the firstName and barangay from the user record
      const { brgy } = address;
      const {link} = profile
  
      const result = await ActivityLogs.create({
        user: id,
        firstname: firstName,
        lastname: lastName,
        profile: link,
        type: type,
        action,
        details,
        ip,
        brgy: brgy
      });
  
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


module.exports = {
    GetActivityLog,
    AddActLog,
};
