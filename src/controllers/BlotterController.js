const mongoose = require("mongoose");

const Patawag = require("../models/BlotterModel");
const GenerateID = require("../functions/GenerateID");

const {
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const composePatawag = async (req, res) => {
  try {
    const { patawag_folder_id } = req.query;
    const { body, files } = req;
    const { name, to, responses, brgy, req_id } = JSON.parse(body.patawag);

    // console.log("patawag_folder_id: ", patawag_folder_id);
    // console.log("responses: ", responses);
    // console.log("body: ", body);
    // console.log("to: ", to);
    // console.log("files: ", files);

    let fileArray = [];
    const patawag_id = GenerateID("", brgy, "P");
    const folder_id = await createRequiredFolders(
      patawag_id,
      patawag_folder_id
    );

    // console.log("folder_id: ", folder_id);

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
        const { id, name } = await uploadFolderFiles(files[f], folder_id);

        fileArray.push({
          link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
          id,
          name,
        });
      }
    }

    const result = await Patawag.create({
      patawag_id,
      req_id,
      name,
      to: to,
      responses: responses.map(response => ({
        sender: response.sender || "",
        type: response.type || "",
        message: response.message || "",
        date: response.date || new Date().toISOString(),
        file: fileArray,
      })),
      brgy,
      folder_id,
      // file: fileArray,
    });

    console.log("Create Patawag Result: ", result);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const Respond = async (req, res) => {
  try {
    const { patawag_id } = req.query;
    const { body, files } = req;
    const response = JSON.parse(body.response);
    const { sender, type, message, date, folder_id } = response;

    console.log(body, files);
    console.log("patawag_id: ", patawag_id);
    // console.log(sender, type, message, date, folder_id);
    // console.log("response: ", response);

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

    // take note yung laman ng patawag_id dito is _id
    const result = await Patawag.findByIdAndUpdate(
      { _id: patawag_id },
      {
        $push: {
          responses: {
            sender: sender,
            type: type,
            message: message,
            date: date,
            file: fileArray,
          },
        },
      },
      { new: true }
    );

    console.log("result: ", result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const specPatawag = async (req, res) => {
  try {
    const { req_id, brgy } = req.query;

    const patawag = await Patawag.findOne({ req_id: req_id, brgy: brgy });

    if (!patawag) {
      return res.status(404).json({ error: "Patawag not found" });
    }

    res.status(200).json(patawag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  composePatawag,
  Respond,
  specPatawag,
};
