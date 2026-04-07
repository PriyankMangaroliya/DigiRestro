const tokenController = require("../token-controller");
const mongoose = require("mongoose");
module.exports = {
    viewTable: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const areas = await areaSchema.find({
                branch_id: new mongoose.Types.ObjectId(branchId), is_active: true, deleted: false
            });

            const table = await tableOfAreaSchema.find({
                area_id: {$in: areas.map(area => area._id)}, deleted: false
            });

            function getAreaName(areaId) {
                const foundArea = areas.find(area => area._id.toString() === areaId.toString());
                return foundArea ? foundArea.area_name : 'N/A';
            }

            // console.log(table)

            res.render(`${appPath}/branch/master-table.ejs`, {
                area: areas, getAreaName: getAreaName, tables: table
            });

        } catch (error) {
            console.error("Error in /branch/viewTables:", error);
        }

    }, 
    addTable: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await tableOfAreaSchema.findOne({
                table_name: req.body.table_name,
                branch_id: new mongoose.Types.ObjectId(branchId),
                deleted: false
            });

            if (existingData) {
                req.session.Error = "Table with this name already exists.";
                return res.redirect("/branch/master-table");
            } else {
                const newTable = new tableOfAreaSchema({
                    table_name: req.body.table_name,
                    capacity: req.body.capacity,
                    area_id: new mongoose.Types.ObjectId(req.body.area_id),
                    branch_id: new mongoose.Types.ObjectId(branchId) // Ensure branch_id is set
                });

                const result = await newTable.save();

                if (!result) {
                    req.session.Error = "Failed to add table.";
                } else {
                    req.session.Success = "Table added successfully.";
                }
                res.redirect("/branch/master-table");
            }
        } catch (error) {
            console.error("Error in /branch/addTable:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-table");
        }
    },
    updateTableOfArea: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await tableOfAreaSchema.findOne({
                table_name: req.body.table_name,
                branch_id: new mongoose.Types.ObjectId(branchId),
                deleted: false,
                _id: { $ne: new mongoose.Types.ObjectId(req.body.table_id) }
            });

            if (existingData) {
                req.session.Error = "Another table with this name already exists.";
                return res.redirect("/branch/master-table");
            } else {
                const result = await tableOfAreaSchema.updateOne(
                    { _id: new mongoose.Types.ObjectId(req.body.table_id) },
                    {
                        $set: {
                            table_name: req.body.table_name,
                            capacity: req.body.capacity,
                            area_id: new mongoose.Types.ObjectId(req.body.area_id)
                        }
                    }
                );

                if (result.modifiedCount > 0) {
                    req.session.Success = "Table updated successfully.";
                } else {
                    req.session.Error = "No changes were made or table not found.";
                }
                res.redirect("/branch/master-table");
            }
        } catch (error) {
            console.error("Error in /branch/updateTableOfArea:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-table");
        }
    },
    activeAndDeactive: async (req, res) => {
        try {
            const table = await tableOfAreaSchema.findById(req.query.id);
            if (!table) {
                req.session.Error = "Table not found.";
                return res.redirect("/branch/master-table");
            }

            const newValue = !table.is_active;

            const result = await tableOfAreaSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(req.query.id) },
                { $set: { is_active: newValue } }
            );

            if (result.modifiedCount === 1) {
                req.session.Success = `Table ${newValue ? 'activated' : 'deactivated'} successfully.`;
            } else {
                req.session.Error = "Failed to update status.";
            }
            res.redirect("/branch/master-table");
        } catch (error) {
            console.error("Error updating Table:", error);
            req.session.Error = "An internal error occurred.";
            res.redirect("/branch/master-table");
        }
    },
    deleteTables: async (req, res) => {
        try {
            const tableId = req.query.id;

            const result = await tableOfAreaSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(tableId) },
                { $set: { is_active: false, deleted: true } }
            );

            if (result.acknowledged === true && result.modifiedCount > 0) {
                res.status(200).json({ success: true, message: 'Table deleted successfully.' });
            } else {
                res.status(404).json({ success: false, message: 'Table not found.' });
            }
        } catch (error) {
            console.error("Error in deleteTables:", error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}