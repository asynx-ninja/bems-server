const mongoose = require("mongoose");
const BrgyInformation = require("../models/BrgyInfoModel");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetBarangayInformation = async (req, res) => {
  try {
    const { brgy, logo } = req.query;

    const result = await BrgyInformation.find(
      { brgy: brgy },
      logo !== undefined ? { logo: 1, _id: 0 } : null
    );

    return !result
      ? res
          .status(400)
          .json({ error: `No such Information for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllBarangay = async (req, res) => {
  try {
    const allinfo = await BrgyInformation.aggregate([
      {
        $project: {
          _id: 0,
          brgy: 1,
          mission: 1,
          story: 1,
          vision: 1,
          banner: "$banner.link",
          logo: "$logo.link",
        },
      },
    ]);

    // console.log("aa", allinfo);

    if (allinfo.length === 0) {
      return res.status(400).json({ error: "No barangays found." });
    }

    res.status(200).json(allinfo);
  } catch (error) {
    console.error(error);
  }
};

// CHECK
const AddBarangayInfo = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { body, files } = req;
    const { story, mission, vision, brgy, theme } = JSON.parse(body.brgyinfo);
    let fileArray = [];

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFolderFiles(files[f], folder_id);

      fileArray.push({
        link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
        id,
        name,
      });
    }

    const [banner, logo] = fileArray;
    const bannerObject = Object.assign({}, banner);
    const logoObject = Object.assign({}, logo);

    const result = await BrgyInformation.create({
      story,
      mission,
      vision,
      officials: [],
      brgy,
      banner: bannerObject,
      logo: logoObject,
      theme: theme
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHECK
const UpdateBarangayInfo = async (req, res) => {
  const { folder_id } = req.query;
  const { brgy } = req.params;
  const { body, files } = req;

  const brgyData = JSON.parse(body.brgyinfo);
  const { story, mission, vision, banner, logo, theme } = brgyData;

  let bannerNew = null,
    logoNew = null;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const { id, name } = await uploadFolderFiles(files[i], folder_id);

      if (files[i].originalname.includes("banner")) {
        bannerNew = {
          link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
          id,
          name,
        };

        if (banner.id !== "") await deleteFolderFiles(banner.id, folder_id);
      } else if (files[i].originalname.includes("logo")) {
        logoNew = {
          link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
          id,
          name,
        };

        if (logo.id !== "") await deleteFolderFiles(logo.id, folder_id);
      }
    }
  }

  const result = await BrgyInformation.findOneAndUpdate(
    { brgy: brgy },
    {
      $set: {
        story,
        mission,
        vision,
        banner: bannerNew === null ? banner : bannerNew,
        logo: logoNew === null ? logo : logoNew,
        theme: theme
      },
    },
    { new: true }
  );

  return !result
    ? res.status(400).json({ error: "Info is not updated" })
    : res.status(200).json(result);
};

module.exports = {
  GetBarangayInformation,
  GetAllBarangay,
  AddBarangayInfo,
  UpdateBarangayInfo,
};
