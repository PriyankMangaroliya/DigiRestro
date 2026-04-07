const tokenController = require("../token-controller");
const mongoose = require("mongoose");
module.exports = {
    viewArea: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const areas = await areaSchema.find({
                branch_id: new mongoose.Types.ObjectId(branchId), deleted: false
            });

            res.render(`${appPath}/branch/master-area.ejs`, {
                area: areas
            });

        } catch (error) {
            console.error("Error in /branch/viewBranch:", error);
        }
    }, 
    addArea: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await areaSchema.findOne({
                area_name: req.body.area_name,
                deleted: true,
                branch_id: new mongoose.Types.ObjectId(branchId)
            });

            if (existingData) {
                req.session.Error = "Area with this name already exists.";
                return res.redirect("/branch/master-area");
            } else {
                const newArea = new areaSchema({
                    area_name: req.body.area_name,
                    branch_id: new mongoose.Types.ObjectId(branchId)
                });

                const result = await newArea.save();

                if (!result) {
                    req.session.Error = "Failed to add area.";
                } else {
                    req.session.Success = "Area added successfully.";
                }
                res.redirect("/branch/master-area");
            }
        } catch (error) {
            console.error("Error in /branch/addArea:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-area");
        }
    },
    updateArea: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await areaSchema.findOne({
                area_name: req.body.area_name,
                branch_id: new mongoose.Types.ObjectId(branchId),
                _id: { $ne: new mongoose.Types.ObjectId(req.body.area_id) }
            });

            if (existingData) {
                req.session.Error = "Another area with this name already exists.";
                return res.redirect("/branch/master-area");
            } else {
                const result = await areaSchema.updateOne(
                    { _id: new mongoose.Types.ObjectId(req.body.area_id) },
                    { $set: { area_name: req.body.area_name } }
                );

                if (result.modifiedCount > 0) {
                    req.session.Success = "Area updated successfully.";
                } else {
                    req.session.Error = "No changes were made or area not found.";
                }
                res.redirect("/branch/master-area");
            }
        } catch (error) {
            console.error("Error in /branch/updateArea:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-area");
        }
    },
    activeAndDeactive: async (req, res) => {
        try {
            const area = await areaSchema.findById(req.query.id);
            if (!area) {
                req.session.Error = "Area not found.";
                return res.redirect("/branch/master-area");
            }

            const newValue = !area.is_active;

            const result = await areaSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(req.query.id) },
                { $set: { is_active: newValue } }
            );

            if (result.modifiedCount === 1) {
                req.session.Success = `Area ${newValue ? 'activated' : 'deactivated'} successfully.`;
            } else {
                req.session.Error = "Failed to update status.";
            }
            res.redirect("/branch/master-area");
        } catch (error) {
            console.error("Error updating area:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-area");
        }
    },
    deleteArea: async (req, res) => {
        try {
            const areaId = req.query.id;

            const result = await areaSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(areaId) },
                { $set: { is_active: false, deleted: true } }
            );

            if (result.acknowledged === true && result.modifiedCount > 0) {
                res.status(200).json({ success: true, message: 'Area deleted successfully.' });
            } else {
                res.status(404).json({ success: false, message: 'Area not found.' });
            }
        } catch (error) {
            console.error("Error in deleteArea:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}