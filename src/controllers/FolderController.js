const mongoose = require("mongoose");
const Folder = require("../models/FolderModel");

const {
  createBarangayFolder,
  createRequiredFolders,
} = require("../utils/Drive");

const GetAllBrgyFolders = async (req, res) => {
  try {
    const result = await Folder.find({});

    return !result
      ? res.status(400).json({ error: `No such folders` })
      : res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const GetSpecificBrgyFolders = async (req, res) => {
  try {
    const { brgy } = req.query;
    const result = await Folder.find({ brgy: brgy });

    return !result
      ? res.status(400).json({ error: `No such folders` })
      : res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const CreateBrgyFolders = async (req, res) => {
  try {
    const { brgy } = req.query;

    const root_folder_id = await createBarangayFolder(brgy.toUpperCase());

    const events_folder_id = await createRequiredFolders(
      "EVENTS",
      root_folder_id
    );
    const application_folder_id = await createRequiredFolders(
      "APPLICATION",
      root_folder_id
    );
    const request_folder_id = await createRequiredFolders(
      "REQUESTS",
      root_folder_id
    );
    const service_folder_id = await createRequiredFolders(
      "SERVICES",
      root_folder_id
    );
    const pfp_folder_id = await createRequiredFolders("PFP", root_folder_id);
    const official_folder_id = await createRequiredFolders(
      "OFFICIALS",
      root_folder_id
    );
    const info_folder_id = await createRequiredFolders("INFO", root_folder_id);
    const inquiries_folder_id = await createRequiredFolders(
      "INQUIRIES",
      root_folder_id
    );

    const result = await Folder.create({
      root: root_folder_id,
      events: events_folder_id,
      request: request_folder_id,
      service: service_folder_id,
      pfp: pfp_folder_id,
      official: official_folder_id,
      info: info_folder_id,
      inquiries: inquiries_folder_id,
      application: application_folder_id,
      brgy: brgy,
    });

    return !result
      ? res.status(400).json({ error: `No created folder` })
      : res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  GetAllBrgyFolders,
  GetSpecificBrgyFolders,
  CreateBrgyFolders,
};
