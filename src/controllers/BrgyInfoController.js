const mongoose = require("mongoose");
const BrgyInformation = require("../models/BrgyInfoModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

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
    // Retrieve logo, barangay name, and banner link
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
      }, // Project the desired fields
    ]);

    // Send successful response with the retrieved data
    res.status(200).json(allinfo);

    // Log the first document
    console.log("aa", allinfo);

    // Check if no barangays found
    if (allinfo.length === 0) {
      return res.status(400).json({ error: "No barangays found." });
    }
  } catch (error) {
    // Handle errors and send error response
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const AddBarangayInfo = async (req, res) => {
  try {
    const { body, files } = req;
    const { story, mission, vision, brgy } = JSON.parse(body.brgyinfo);
    let fileArray = [];

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadPicDrive(
        files[f],
        ReturnBrgyFormat(brgy),
        "I"
      );

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
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateBarangayInfo = async (req, res) => {
  const { brgy } = req.params;
  const { body, files } = req;
  console.log(body, files);

  const brgyData = JSON.parse(body.brgyinfo);
  const { story, mission, vision, banner, logo } = brgyData;

  let bannerNew = null,
    logoNew = null;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const { id, name } = await uploadPicDrive(
        files[i],
        ReturnBrgyFormat(brgy),
        "I"
      );

      if (files[i].originalname === "banner") {
        bannerNew = {
          link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
          id,
          name,
        };
        if (banner.id !== "")
          await deletePicDrive(banner.id, ReturnBrgyFormat(brgy), "I");
      } else if (files[i].originalname === "logo") {
        logoNew = {
          link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
          id,
          name,
        };
        if (logo.id !== "")
          await deletePicDrive(logo.id, ReturnBrgyFormat(brgy), "I");
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
