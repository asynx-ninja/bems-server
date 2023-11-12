const mongoose = require("mongoose");
const BrgyInformation = require("../models/BrgyInfoModel");
const GenerateID = require("../functions/GenerateID");

const { uploadFileDrive, createFolder, deleteFileDrive } = require("../utils/Drive");

const GetBarangayInformation = async (req, res) => {
    const { brgy, archived } = req.query;

    const result = await BrgyInformation.find({
        $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return !result
        ? res.status(400).json({ error: `No such Information for Barangay ${brgy}` })
        : res.status(200).json(result);
};

const AddBarangayOfficials = async (req, res) => {
    try {
        const { body, files } = req;
        const brgyData = JSON.parse(body.brgyinfo);
        const { title, details, date, brgy } = brgyData;

        let fileArray = [];
        const event_id = GenerateID(brgy, "O");
        const folder_id = await createFolder(ReturnBrgyFormat(brgy), "O", event_id);

        for (let f = 0; f < files.length; f += 1) {
            const { id, name } = await uploadFileDrive(files[f], folder_id);

            fileArray.push({
                link: f === 0 || f === 1
                    ? `https://drive.google.com/uc?export=view&id=${id}`
                    : `https://drive.google.com/file/d/${id}/view`,
                id,
                name,
            });
        }

        const [banner, logo, ...remainingFiles] = fileArray;

        const result = await brgyinfo.create({
            event_id,
            title,
            details,
            date,
            collections: {
                folder_id: folder_id,
                banner,
                logo,
                file: remainingFiles,
            },
            attendees: [],
            brgy,
        });

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};






module.exports = {
    GetBarangayInformation,
    AddBarangayOfficials,
    // Updatebrgyinfo,
    // Archivebrgyinfo,
    // GetBrgybrgyinfoBanner,
    // UpdateAttendees
};