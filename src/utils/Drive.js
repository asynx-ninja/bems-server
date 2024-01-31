const { google } = require("googleapis");
const fs = require("fs");
const authorize = require("../config/GDrive");
const ReturnBarangay = require("../functions/ReturnBarangay");

const createBarangayFolder = async (brgy) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.create({
      fields: "id",
      resource: {
        name: brgy,
        mimeType: "application/vnd.google-apps.folder",
        parents: ["1c_NzEnhpctBYjAEufzx-zE4euBx21PJQ"],
      },
    });


  return data.id;
};

const createRequiredFolders = async (name, folder_id) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.create({
      fields: "id",
      resource: {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folder_id],
      },
    });

  return data.id;
};

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

const uploadFolderFiles = async (fileObject, folder_id) => {
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

const uploadPicDrive = async (fileObject, brgy, type) => {
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



const deleteFileDrive = async (fileID, folder_id) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.delete({
      fileId: fileID,
      parent: folder_id,
    });

  return data;
};

const deletePicDrive = async (fileID, brgy, type) => {
  const { data } = await google
    .drive({ version: "v3", auth: authorize })
    .files.delete({
      fileId: fileID,
      parent: [ReturnBarangay(brgy, type)],
    });

  return data;
};

module.exports = {
  createFolder,
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  uploadPicDrive,
  uploadFileDrive,
  deleteFileDrive,
  deletePicDrive,
};
