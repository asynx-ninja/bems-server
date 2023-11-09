const mongoose = require("mongoose");

const ServicesForm = require("../models/ServicesFormModel");

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
    const { form } = req.body;

    console.log(form);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetServiceForm,
  CreateServiceForm,
};
