const mongoose = require("mongoose");
const BrgyInformation = require("../models/BrgyInfoModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetBarangayInformation = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await BrgyInformation.find({ brgy: brgy });

    return !result
      ? res
          .status(400)
          .json({ error: `No such Information for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const AddBarangayInfo = async (req, res) => {
  try {
    const { body, files } = req;
    const brgyData = JSON.parse(body.info);
    const { story, mission, vision, brgy } = brgyData;

    let fileArray = [];

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadPicDrive(
        files[f],
        ReturnBrgyFormat(brgy),
        "I"
      );

      fileArray.push({
        link: `https://drive.google.com/uc?export=view&id=${id}`,
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
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  GetBarangayInformation,
  AddBarangayInfo,
  // Updatebrgyinfo,
  // Archivebrgyinfo,
  // GetBrgybrgyinfoBanner,
  // UpdateAttendees
};
