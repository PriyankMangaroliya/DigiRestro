const mongoose = require("mongoose");
module.exports = {
    viewClient: async (req, res) => {
        try {

            const users = await usersSchema.aggregate([
                {
                  $match: {
                    role_name: "O" // Filter users with role_name as "O"
                  }
                },
                {
                  $lookup: {
                    from: "company", // Assuming the collection name is "company"
                    localField: "_id", // Field in usersSchema collection
                    foreignField: "user_id", // Field in company collection referencing owner's _id
                    as: "companies" // Output array field name
                  }
                },
                {
                  $unwind: "$companies" // Deconstruct the companies array into separate documents
                },
                {
                  $group: {
                    _id: "$_id", // Group by user's _id
                    name: { $first: "$name" }, // Get the first user's name (assuming unique)
                    email_id: { $first: "$email_id" }, // Get the first user's email_id (assuming unique)
                    mobile_no: { $first: "$mobile_no" }, // Get the first user's mobile_no (assuming unique)
                    totalCompanies: { $sum: 1 } // Count the number of documents after unwinding (companies)
                  }
                }
              ]);

            // console.log("jbdjjhdbchbbh");
            // const users = await usersSchema.aggregate([
            //     {
            //         $match: {
            //             role_name: "O" // Filter users with role_name as "O"
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "company", // Assuming the collection name is "company"
            //             localField: "_id", // Field in usersSchema collection
            //             foreignField: "user_id", // Field in company collection referencing owner's _id
            //             as: "companies" // Output array field name
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 1, // Keep the user's _id
            //             name: 1,
            //             email_id: 1,
            //             mobile_no: 1,
            //             totalCompanies: { $sum: "$companies" } // Count the number of companies
            //         }
            //     }
            // ]);
            console.log(users);
            // const users = await usersSchema.find({role_name: "O"});
            res.render(`${appPath}/admin/view-client.ejs`, {users});
        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}