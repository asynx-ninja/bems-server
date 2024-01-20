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
    const { brgy, archived, id, status, type, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ brgy: brgy }, { isArchived: archived }],
    };

    if (id !== undefined) {
      query.$and.push({ _id: id });
    }

    if (status && status.toLowerCase() !== "all") {
      query.status = status;
    }

    if (type && type.toLowerCase() !== "all") {
      query.type = type;
    }

    const totalRequests = await Request.countDocuments(query);

    const result = await Request.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such request for Barangay ${brgy}` })
      : res
          .status(200)
          .json({ result, pageCount: Math.ceil(totalRequests / itemsPerPage) });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const GetRequestByUser = async (req, res) => {
  try {
    const { user_id, page } = req.query;

    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const totalEventsApplications = await Request.countDocuments({
      "form.user_id.value": user_id,
    });

    const result = await Request.find({
      "form.user_id.value": user_id,
    })
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such event application` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalEventsApplications / itemsPerPage),
        });
  } catch (error) {
    console.log(error);
  }
};

const CreateRequest = async (req, res) => {
  try {
    const { body, files } = req;
    const newBody = JSON.parse(body.form);
    //console.log(newBody, files);

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
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
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
    const { req_id, user_type } = req.query;
    const { body, files } = req;

    const {
      sender,
      message,
      status,
      date,
      isRepliable,
      folder_id,
      last_sender,
      last_array,
    } = JSON.parse(body.response);

    let fileArray = [];

    if (!mongoose.Types.ObjectId.isValid(req_id)) {
      return res.status(400).json({ error: "No such request" });
    }

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

    if (user_type) {
      await Request.findByIdAndUpdate(
        { _id: req_id },
        {
          $set: {
            [`response.${last_array}`]: {
              sender: last_sender.sender,
              message: last_sender.message,
              date: last_sender.date,
              file: last_sender.file,
              isRepliable: false,
            },
          },
        }
      );
    }

    const result = await Request.findByIdAndUpdate(
      { _id: req_id },
      {
        $push: {
          response: {
            sender: sender,
            message: message,
            date: date,
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

const ArchiveRequest = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await Request.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: archived } },
      { returnOriginal: false, upsert: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetAllRequest,
  GetRequestByUser,
  CreateRequest,
  RespondToRequest,
  ArchiveRequest,
};
