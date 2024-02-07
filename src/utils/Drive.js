const { google } = require("googleapis");
const fs = require("fs");
const authorize = require("../config/GDrive");

// CREATE FOLDER FOR BARANGAY
const createBarangayFolder = async (brgy) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

// CREATE SEVERAL FOLDERS UNDER SPECIFIC BARANGAY FOLDER
const createRequiredFolders = async (name, folder_id) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

// UPLOAD FILES AND IMAGES IN FOLDER
const uploadFolderFiles = async (fileObject, folder_id) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

// DELETE FOLDER FILES
const deleteFolderFiles = async (fileID, folder_id) => {
  try {
    const { data } = await google
      .drive({ version: "v3", auth: authorize })
      .files.delete({
        fileId: fileID,
        parent: folder_id,
      });

    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
};
