const mongoose = require("mongoose");

const Patawag = require("../models/BlotterModel");
const GenerateID = require("../functions/GenerateID");

const {
    uploadFolderFiles,
    deleteFolderFiles,
} = require("../utils/Drive");


const composePatawag = async (req, res) => {
    try {
        const { patawag_folder_id } = req.query;
        const { body, files } = req;
        const { name, to, brgy, user_id } = JSON.parse(body.inquiries);

        let fileArray = [];
        const patawag_id = GenerateID("", brgy, "P");
        const folder_id = await createRequiredFolders(patawag_id, patawag_folder_id);

        for (let f = 0; f < files.length; f += 1) {
            const { id, name } = await uploadFolderFiles(files[f], folder_id);


            fileArray.push({
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name,
            });
        }

        const result = await Patawag.create({
            patawag_id,
            name,
            to: {
                lastName: to.lastName || "",
                firstName: to.firstName || "",
                middleName: to.middleName || "",
                type: to.type || "",
            },
            brgy,
            folder_id,
            user_id,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const Respond = async (req, res) => {
    try {
        const { brgy, patawag_id } = req.query;
        const { body, files } = req;
        const response = JSON.parse(body.response);
        const { sender, type, message, date, folder_id, status } = response;

        let fileArray = [];

        if (files) {
            for (let f = 0; f < files.length; f++) {
                const { id, name } = await uploadFolderFiles(files[f], folder_id);

                fileArray.push({
                    link: files[f].mimetype.includes("image")
                        ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
                        : `https://drive.google.com/file/d/${id}/view`,
                    id,
                    name,
                });
            }
        }

        const result = await Patawag.findByIdAndUpdate(
            { _id: patawag_id },
            {
                $push: {
                    response: {
                        sender: sender,
                        type: type,
                        message: message,
                        date: date,
                        file: fileArray.length > 0 ? fileArray : null,
                    },
                },
            },
            { new: true }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const specPatawag = async (req, res) => {
    try {
        const { id, brgy } = req.query;

        const patawag = await Patawag.findOne({ _id: id, brgy: brgy });

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