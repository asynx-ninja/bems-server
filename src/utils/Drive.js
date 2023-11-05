const { google } = require("googleapis");
const fs = require("fs");
const authorize = require("../config/GDrive");
const ReturnBarangay = require("../functions/ReturnBarangay");

const createFolder = async (brgy, type, service_id) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.create({
      fields: "id",
      resource: {
        name: service_id,
        mimeType: "application/vnd.google-apps.folder",
        parents: [ReturnBarangay(brgy, type)],
      },
    });

  return data.id;
};

const uploadPicDrive = async (fileObject, brgy , type) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: fs.createReadStream(fileObject.path),
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [ReturnBarangay(brgy, type)],
      },
      fields: "id,name",
    });

  return data;
};

const uploadFileDrive = async (fileObject, folder_id) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: fs.createReadStream(fileObject.path),
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [folder_id],
      },
      fields: "id,name",
    });

  return data;
};

const deleteFileDrive = async (fileID, folder_id) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.delete({
      fileId: fileID,
      parent: folder_id,
    });

  return data;
};

module.exports = {
  createFolder,
  uploadPicDrive,
  uploadFileDrive,
  deleteFileDrive,
};
