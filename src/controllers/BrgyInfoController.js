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
    const { story, mission, vision, brgy } = JSON.parse(body.brgyinfo);
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

  
const UpdateBarangayInfo = async (req, res) => {
    const { brgy } = req.params;
    const { body, files } = req;
    console.log(brgy, body, files);
   
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
          await deletePicDrive(banner.id, ReturnBrgyFormat(brgy), "I");

        } else if (files[i].originalname === "logo") {
          logoNew = {
            link: `https://drive.google.com/uc?export=view&id=${id}`,
            id,
            name,
          };
          await deletePicDrive(logo.id, ReturnBrgyFormat(brgy), "I");
        }
      }
    }
  
    const updateFields = {
      story,
      mission,
      vision,
      banner: banner === null ? banner : bannerNew,
      logo: logo === null ? logo : logoNew,
    };
  
    const result = await BrgyInformation.findOneAndUpdate(
      { brgy: brgy },
      { $set: updateFields },
      { new: true }
    );
  
    return !result
      ? res.status(400).json({ error: "Info is not updated" })
      : res.status(200).json(result);
  };
  
  

module.exports = {
  GetBarangayInformation,
  AddBarangayInfo,
  UpdateBarangayInfo,
};
