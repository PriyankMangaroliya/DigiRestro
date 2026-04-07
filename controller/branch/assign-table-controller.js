const tokenController = require("../token-controller");
const mongoose = require("mongoose");

module.exports = {
    viewAssignTable: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const areaWiseTables = await areaSchema.aggregate([
                {
                    $match: {
                        branch_id: new mongoose.Types.ObjectId(branchId),
                        is_active: true,
                    },
                },
                {
                    $lookup: {
                        from: "table_of_area",
                        localField: "_id",
                        foreignField: "area_id",
                        as: "tables",
                    },
                },
                {
                    $unwind: "$tables",
                },
                {
                    $match: {
                        "is_active" : true,
                        "tables.is_active": true,
                        "tables.deleted": false,
                    },
                },
                {
                    $lookup: {
                        from: "orders",
                        let: {tableId: "$tables._id"},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$table_id", "$$tableId"]},
                                            {$ne: ["$status", 4]}
                                        ]
                                    }
                                }
                            },
                            {$sort: {created_at: -1}},
                            {$limit: 1}
                        ],
                        as: "orders",
                    },
                },
                {
                    $unwind: {
                        path: "$orders",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        "tables.area_name": 1,
                        "tables.table_name": 1,
                        "orders.created_at": 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            area_name: "$area_name",
                            table_id: "$tables._id",
                        },
                        last_order: {$first: "$orders"},
                        table_details: {
                            $first: {
                                _id: "$tables._id",
                                table_name: "$tables.table_name",
                                capacity: "$tables.capacity",
                                is_active: "$tables.is_active",
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$_id.area_name",
                        tables: {
                            $push: {
                                _id: "$table_details._id",
                                table_name: "$table_details.table_name",
                                capacity: "$table_details.capacity",
                                is_active: "$table_details.is_active",
                                last_order: "$last_order",
                            },
                        },
                    },
                },
                {
                    $project: {
                        area: "$_id",
                        tables: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: { "area": 1 ,
                        "tables": 1 } // Sort the final result by area_name in ascending order
                },
            ]);
            // console.log(areaWiseTables[0].tables);
            //
            // console.log(areaWiseTables[1].tables);
            // Render the view with the data
            res.render(`${appPath}/branch/assign-table.ejs`, {areaWiseTables});
        } catch (error) {
            console.error("Error in /branch/viewAssignTable:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}