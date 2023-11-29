const mongoose = require("mongoose");
const Request = require("../models/RequestModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  createFolder,
  uploadFileDrive,
  deleteFileDrive,
} = require("../utils/Drive");

const GetAllRequest = async (req, res) => {
  try {
    const { brgy, archived, id } = req.query;
    let result;

    if (id !== undefined) {
      result = await Request.find({
        $and: [{ brgy: brgy }, { isArchived: archived }, { _id: id }],
      });
    } else {
      result = await Request.find({
        $and: [{ brgy: brgy }, { isArchived: archived }],
      });
    }

    return !result
      ? res.status(400).json({ error: `No such request for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const CreateRequest = async (req, res) => {
  try {
    const { body, files } = req;
    const newBody = JSON.parse(body.form);
    // console.log(newBody, files);

    const req_id = GenerateID(newBody.brgy, "R", newBody.name);
    const folder_id = await createFolder(
      ReturnBrgyFormat(newBody.brgy),
      "R",
      req_id
    );
    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
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

    const result = await Request.create({
      req_id,
      service_id: newBody.service_id,
      service_name: newBody.name,
      type: newBody.service_type,
      purpose: newBody.purpose,
      fee: newBody.fee,
      form: newBody.form,
      file: fileArray.length > 0 ? fileArray : [],
      brgy: newBody.brgy,
      payment: {},
      response: [],
      version: newBody.version,
      folder_id: folder_id,
    });

    return res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const RespondToRequest = async (req, res) => {
  try {
    const { req_id } = req.query;
    const { body, files } = req;

    const { sender, message, status, isRepliable, folder_id } = JSON.parse(
      body.response
    );

    let fileArray = [];

    if (!mongoose.Types.ObjectId.isValid(req_id)) {
      return res.status(400).json({ error: "No such request" });
    }

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

    const result = await Request.findByIdAndUpdate(
      { _id: req_id },
      {
        $push: {
          response: {
            sender: sender,
            message: message,
            file: fileArray.length > 0 ? fileArray : null,
            isRepliable: isRepliable,
          },
        },
        $set: {
          status: status,
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  GetAllRequest,
  CreateRequest,
  RespondToRequest,
};
