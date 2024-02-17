const mongoose = require("mongoose");
const Document = require("../models/DocumentModel");
const GenerateVersionID = require("../functions/GenerateVersionID");

const GetAllDocumentForm = async (req, res) => {
  try {
    const { brgy, service_id } = req.query;

    // console.log("REQ QUERY NG DOCU: ", req.query);
    const result = await Document.find({
      $and: [{ brgy: brgy }, { service_id: service_id }],
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
    const { brgy, form_id, checked } = req.query;
    const {
      doc_title,
      service_id,
      details,
      type,
      punong_brgy,
      witnessed_by,
      inputs,
      email,
      address,
      tel,
    } = req.body;

    const result = await Document.create({
      doc_title,
      service_id,
      version_id: GenerateVersionID(brgy),
      form_id,
      details,
      type,
      punong_brgy,
      witnessed_by,
      inputs,
      email,
      address,
      tel,
      brgy,
      isActive: checked,
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

    const result = await Document.findByIdAndUpdate(
      { _id: document._id },
      {
        $set: {
          doc_title: document.doc_title,
          details: document.details,
          type: document.type,
          punong_brgy: document.punong_brgy,
          witnessed_by: document.witnessed_by,
          inputs: document.inputs,
          email: document.email,
          form_id: document.form_id,
          address: document.address,
          tel: document.tel,
          isActive: document.isActive,
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
  UpdateDocumentForm
};
