const mongoose = require("mongoose");
const ServicesForm = require("../models/ServicesFormModel");
const GenerateVersionID = require("../functions/GenerateVersionID");

const GetServiceForm = async (req, res) => {
  try {
    const { service_id } = req.query;

    const result = ServicesForm.find({ service_id: service_id });

    return result.length === 0 || !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateServiceForm = async (req, res) => {
  try {
    const { brgy } = req.query;
    const form = JSON.parse(JSON.stringify(req.body.form));
    const inputFields = JSON.parse(JSON.stringify(req.body.inputFields));

    const newForm = [form, ...inputFields];

    const result = await ServicesForm.create({
      service_id: "1",
      form: {
        structure: newForm,
        version: GenerateVersionID(brgy),
      },
      brgy,
    });

    return res.json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetServiceForm,
  CreateServiceForm,
};
