const mongoose = require("mongoose");
const EventsApplication = require("../models/EventsApplicationModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetAllEventsApplication = async (req, res) => {
  try {
    const { brgy, archived, id, status, page, title } = req.query;
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

    if (title && title.toLowerCase() !== "all") {
      query.$and.push({ event_name: title });
    }

    const totalEventsApplications = await EventsApplication.countDocuments(query);

    const result = await EventsApplication.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(totalEventsApplications / itemsPerPage),
      total: totalEventsApplications,
    });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const GetEventsApplicationByUser = async (req, res) => {
  try {
    const { user_id, page } = req.query;

    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const totalEventsApplications = await EventsApplication.countDocuments({
      "form.user_id.value": user_id,
    });

    const result = await EventsApplication.find({
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

const CountCompleted = async (req, res) => {
  try {
    const { brgy, event_id } = req.query;

    const completedCount = await EventsApplication.countDocuments({
      $and: [
        { brgy: brgy, event_id: event_id, status: "Application Completed" },
      ],
    });

    res.status(200).json({ completedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const GetAllPenApp = async (req, res) => {
  try {
    const { isArchived, page, brgy } = req.query;
    const itemsPerPage = 5; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      brgy,
      isArchived: isArchived,
      status: "Pending",
    };

    const totalEventsApplication = await EventsApplication.countDocuments(
      query
    );
    const result = await EventsApplication.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }

    return res
      .status(200)
      .json({
        result,
        pageCount: Math.ceil(totalEventsApplication / itemsPerPage),
        total: totalEventsApplication,
      });
  } catch (err) {
    res.send(err.message);
  }
};

const GetCountPenApp = async (req, res) => {
  try {
    const { isArchived, brgy } = req.query;
    const query = {
      brgy,
      isArchived: isArchived,
      status: "Pending",
    };
    const result = await EventsApplication.find(query);

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }
    return res.status(200).json({ result });
  } catch (err) {
    res.send(err.message);
  }
};

const CreateEventsApplication = async (req, res) => {
  try {
    const { app_folder_id } = req.query;
    const { body, files } = req;
    const newBody = JSON.parse(body.form);
    // console.log(newBody, files);

    const app_id = GenerateID(newBody.event_name, newBody.brgy, "A");
    const folder_id = await createRequiredFolders(app_id, app_folder_id);
    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
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

    const result = await EventsApplication.create({
      application_id: app_id,
      event_id: newBody.event_id,
      event_name: newBody.event_name,
      form: newBody.form,
      file: fileArray.length > 0 ? fileArray : [],
      brgy: newBody.brgy,
      response: [],
      version: newBody.version,
      folder_id: folder_id,
    });

    return res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const RespondToEventsApplication = async (req, res) => {
  try {
    const { app_id, user_type } = req.query;
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

    if (!mongoose.Types.ObjectId.isValid(app_id)) {
      return res.status(400).json({ error: "No such event application" });
    }

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

    if (user_type && last_array > 0) {
      await EventsApplication.findByIdAndUpdate(
        { _id: app_id },
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

    const result = await EventsApplication.findByIdAndUpdate(
      { _id: app_id },
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

const ArchiveEventsApplication = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await EventsApplication.findOneAndUpdate(
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
  GetAllEventsApplication,
  GetEventsApplicationByUser,
  CreateEventsApplication,
  RespondToEventsApplication,
  ArchiveEventsApplication,
  CountCompleted,
  GetAllPenApp,
  GetCountPenApp,
};
