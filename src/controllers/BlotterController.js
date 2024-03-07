const mongoose = require("mongoose");

const Patawag = require("../models/BlotterModel");
const GenerateID = require("../functions/GenerateID");

const composePatawag = async (req, res) => {
    try {
        const { name, to, responses, brgy, user_id } = req.body;
        const patawag_id = GenerateID("", brgy, "P");

        const patawag = new Patawag({
            patawag_id,
            req_id,
            name,
            to,
            brgy,
            responses,
            user_id
        });

        const savedPatawag = await patawag.save();
        res.status(201).json(savedPatawag);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const Respond = async (req, res) => {
    try {
        const { patawag_id } = req.query;

        const patawag = await Patawag.findById(patawag_id);
        if (!patawag) {
            return res.status(404).json({ error: "Patawag not found" });
        }

        const { sender, type, message, date, file } = req.body;
        const response = { sender, type, message, date, file };

        patawag.responses.push(response);
        const updatedPatawag = await patawag.save();

        res.json(updatedPatawag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const specPatawag = async (req, res) => {
    try {
        const { req_id, brgy } = req.query;

        const patawag = await Patawag.findOne({ req_id: req_id, brgy: brgy });

        if (!patawag) {
            return res.status(404).json({ error: "Patawag not found" });
        }

        res.status(200).json(patawag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    composePatawag,
    Respond,
    specPatawag
}