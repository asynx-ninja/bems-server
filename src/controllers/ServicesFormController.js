const mongoose = require("mongoose");
const ServicesForm = require("../models/ServicesFormModel");
const GenerateVersionID = require("../functions/GenerateVersionID");

const GetAllServiceForm = async (req, res) => {
  try {
    const { brgy, service_id } = req.query;

    const result = await ServicesForm.find({
      $and: [{ brgy: brgy }, { service_id: service_id }],
    });

    return !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateServiceForm = async (req, res) => {
  try {
    const { brgy, service_id, checked } = req.query;
    const { form, inputFields } = req.body;

    const newForm = [form, inputFields];

    const result = await ServicesForm.create({
      service_id: service_id,
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

const UpdateServiceForm = async (req, res) => {
  try {
    const { detail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(detail._id)) {
      return res.status(400).json({ error: "No such service form" });
    }

    const result = await ServicesForm.findByIdAndUpdate(
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
  GetAllServiceForm,
  CreateServiceForm,
  UpdateServiceForm,
};
