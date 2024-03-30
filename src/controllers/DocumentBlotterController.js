const mongoose = require("mongoose");
const DocumentBlotter = require("../models/DocumentBlotterModel");
const GenerateVersionID = require("../functions/GenerateVersionID");

const GetAllDocumentForm = async (req, res) => {
  try {
    const { brgy, req_id } = req.query;

    // console.log("REQ QUERY NG DOCU: ", req.query);
    const result = await DocumentBlotter.find({
      $and: [{ brgy: brgy }, { req_id: req_id }],
    });

    return !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateDocumentForm = async (req, res) => {
  try {
    const { brgy } = req.query;
    const {
      doc_title,
      req_id,
      date,
      usapin_blg,
      reason,
      patawag,
      complainant,
      complainant_address,
      accused,
      accused_address,
      message,
      bcpc_vawc,
      email,
      contact,
    } = req.body;

    const result = await DocumentBlotter.create({
      doc_title,
      req_id,
      version_id: GenerateVersionID(brgy),
      date,
      usapin_blg,
      reason,
      patawag,
      complainant,
      complainant_address,
      accused,
      accused_address,
      message,
      bcpc_vawc,
      email,
      contact,
      brgy,
    });

    return res.json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UpdateDocumentForm = async (req, res) => {
  try {
    const { document } = req.body;

    if (!mongoose.Types.ObjectId.isValid(document._id)) {
      return res.status(400).json({ error: "No such document form" });
    }

    const result = await DocumentBlotter.findByIdAndUpdate(
      { _id: document._id },
      {
        $set: {
          doc_title: document.doc_title,
          date: document.date,
          usapin_blg: document.usapin_blg,
          reason: document.reason,
          patawag: document.patawag,
          complainant: document.complainant,
          complainant_address: document.complainant_address,
          accused: document.accused,
          accused_address: document.accused_address,
          message: document.message,
          bcpc_vawc: document.bcpc_vawc,
          email: document.email,
          contact: document.contact,
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
  GetAllDocumentForm,
  CreateDocumentForm,
  UpdateDocumentForm,
};
