const mongoose = require("mongoose");
const AnnouncementForm = require("../models/AnnouncementFormModel");
const GenerateVersionID = require("../functions/GenerateVersionID");

const GetAllEventsForm = async (req, res) => {
  try {
    const { brgy, event_id } = req.query;

    const result = await AnnouncementForm.find({
      $and: [{ brgy: brgy }, { event_id: event_id }],
    });

    return !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetActiveForm = async (req, res) => {
  try {
    const { brgy, event_id } = req.query;
    let result;

    if (brgy === undefined) {
      result = await AnnouncementForm.find({
        $and: [{ event_id: event_id }, { isActive: true }],
      });
    } else {
      result = await AnnouncementForm.find({
        $and: [{ brgy: brgy }, { event_id: event_id }, { isActive: true }],
      });
    }

    return !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateEventsForm = async (req, res) => {
  try {
    const { brgy, event_id, checked } = req.query;
    const { form, section } = req.body;

    const newForm = [form, section];

    const result = await AnnouncementForm.create({
      event_id: event_id,
      form: newForm,
      version: GenerateVersionID(brgy),
      brgy,
      isActive: checked,
    });

    return res.json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UpdateEventsForm = async (req, res) => {
  try {
    const { detail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(detail._id)) {
      return res.status(400).json({ error: "No such service form" });
    }

    const result = await AnnouncementForm.findByIdAndUpdate(
      { _id: detail._id },
      {
        $set: {
          form: detail.form,
          isActive: detail.isActive,
        },
      },
      { new: true }
    );

    return res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetAllEventsForm,
  CreateEventsForm,
  UpdateEventsForm,
  GetActiveForm,
};
