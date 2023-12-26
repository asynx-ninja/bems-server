const mongoose = require("mongoose");
const ServicesInformation = require("../models/MServicesInfoModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetServicesInformation = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await ServicesInformation.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return result
      ? res.status(200).json(result)
      : res
          .status(400)
          .json({ error: `No officials found for Municipality ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const GetAllServicesInfo = async (req, res) => {
  try {
    // Retrieve logo, barangay name, and banner link
    const allinfo = await ServicesInformation.find({});

    // Send successful response with the retrieved data
    res.status(200).json(allinfo);
  } catch (error) {
    // Handle errors and send error response
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const AddServicesInfo = async (req, res) => {
  try {
    const { body, files } = req;
    const { name, details, brgy } = JSON.parse(body.servicesinfo);
    let fileArray = [];

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadPicDrive(
        files[f],
        ReturnBrgyFormat(brgy),
        "SI"
      );

      fileArray.push({
        link: `https://drive.google.com/uc?export=view&id=${id}`,
        id,
        name,
      });
    }

    const [icon] = fileArray;
    const iconObject = Object.assign({}, icon);

    const result = await ServicesInformation.create({
      name,
      details,
      brgy,
      icon: iconObject,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateServicesInfo = async (req, res) => {
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
          link: `https://drive.google.com/uc?export=view&id=${id}`,
          id,
          name,
        };
        if (banner.id !== "")
          await deletePicDrive(banner.id, ReturnBrgyFormat(brgy), "I");
      } else if (files[i].originalname === "logo") {
        logoNew = {
          link: `https://drive.google.com/uc?export=view&id=${id}`,
          id,
          name,
        };
        if (logo.id !== "")
          await deletePicDrive(logo.id, ReturnBrgyFormat(brgy), "I");
      }
    }
  }

  const result = await ServicesInformation.findOneAndUpdate(
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
  GetServicesInformation,
  GetAllServicesInfo,
  AddServicesInfo,
  UpdateServicesInfo,
};
