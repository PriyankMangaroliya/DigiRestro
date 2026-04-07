const {setDefaultCompany, fetchAndFormatCompanies, handleAuthRedirect} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewSubCategory: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);


            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session sub-category: " + companyId)

            const foodCategories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(companyId), is_active: true
            });


            const result = await foodCategorySchema.aggregate([{
                $match: {
                    company_id: new mongoose.Types.ObjectId(companyId), is_active: true
                }
            }, {
                $lookup: {
                    from: "food_sub_category",
                    localField: "_id",
                    foreignField: "food_category_id",
                    as: "foodSubCategories"
                }
            }, {
                $unwind: "$foodSubCategories"
            }, {
                $lookup: {
                    from: "food_item",
                    localField: "foodSubCategories._id",
                    foreignField: "food_sub_category_id",
                    as: "foodItems"
                }
            }, {
                $lookup: {
                    from: "food_category",
                    localField: "foodSubCategories.food_category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
                {
                    $match: {
                        "foodSubCategories.deleted": {$ne: true},
                        "category.deleted": {$ne: true},
                        "foodItems.deleted": {$ne: true},
                    }
                },
                {
                    $project: {
                        _id: "$foodSubCategories._id",
                        category_name: {$arrayElemAt: ["$category.category_name", 0]},
                        food_category_id: {$arrayElemAt: ["$category._id", 0]},
                        sub_category_name: "$foodSubCategories.sub_category_name",
                        is_active: "$foodSubCategories.is_active",
                        totalFood: {$size: "$foodItems"}
                    }
                }]);


            console.log(result)

            res.render(`${appPath}/company/master-sub-category.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                foodSubCategories: result,
                foodCategories: foodCategories,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });
        } catch (error) {
            console.error("Error in manage-sub-category: ", error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    },
    addSubCategory: async (req, res) => {
        try {
            const existingData = await foodSubCategorySchema.findOne({
                sub_category_name: req.body.sub_category_name,
                food_category_id: req.body.food_category_id,
                deleted: { $ne: true }
            });

            if (existingData) {
                req.session.Error = "Sub-category with this name already exists in the selected category.";
            } else {
                const newSubCategory = new foodSubCategorySchema(req.body);
                const result = await newSubCategory.save();
                if (result) {
                    req.session.Success = "Sub-category added successfully!";
                } else {
                    req.session.Error = "Failed to save sub-category.";
                }
            }
            res.redirect("/company/manage-sub-category");
        } catch (error) {
            console.error("Error in add-sub-category:", error);
            req.session.Error = "An internal error occurred while adding the sub-category.";
            res.redirect("/company/manage-sub-category");
        }
    },
    updateSubCategory: async (req, res) => {
        try {
            const existingData = await foodSubCategorySchema.findOne({
                sub_category_name: req.body.sub_category_name,
                food_category_id: new mongoose.Types.ObjectId(req.body.food_category_id),
                _id: { $ne: new mongoose.Types.ObjectId(req.body.food_sub_category_id) },
                deleted: { $ne: true }
            });

            if (existingData) {
                req.session.Error = "Another sub-category with this name already exists in the selected category.";
            } else {
                const result = await foodSubCategorySchema.updateOne(
                    { _id: new mongoose.Types.ObjectId(req.body.food_sub_category_id) },
                    {
                        $set: {
                            sub_category_name: req.body.sub_category_name,
                            food_category_id: new mongoose.Types.ObjectId(req.body.food_category_id)
                        }
                    }
                );

                if (result.modifiedCount > 0) {
                    req.session.Success = "Sub-category updated successfully!";
                } else {
                    req.session.Error = "No changes were made or sub-category not found.";
                }
            }
            res.redirect("/company/manage-sub-category");
        } catch (error) {
            console.error("Error in update-sub-category:", error);
            req.session.Error = "An internal error occurred while updating the sub-category.";
            res.redirect("/company/manage-sub-category");
        }
    },
    activeAndDeactive: async (req, res) => {
        try {
            const newValue = req.query.value !== 'true';
            const result = await foodSubCategorySchema.updateOne(
                { _id: new mongoose.Types.ObjectId(req.query.id) },
                { $set: { is_active: newValue } }
            );

            if (result.modifiedCount === 1) {
                req.session.Success = `Sub-category ${newValue ? 'activated' : 'deactivated'} successfully!`;
            } else {
                req.session.Error = "Failed to update sub-category status.";
            }
            res.redirect("/company/manage-sub-category");
        } catch (error) {
            console.error("Error updating sub-category status:", error);
            req.session.Error = "Internal Server Error";
            res.redirect("/company/manage-sub-category");
        }
    },
    deleteSubCategory: async (req, res) => {
        try {
            const subcategoryId = req.query.id;
            const result = await foodSubCategorySchema.updateOne(
                { _id: new mongoose.Types.ObjectId(subcategoryId) },
                { $set: { is_active: false, deleted: true } }
            );
            if (result.modifiedCount > 0) {
                req.session.Success = "Sub-category deleted successfully!";
                res.status(200).json({ success: true, message: 'Sub-category deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Sub-category not found' });
            }
        } catch (error) {
            console.error("deleteSubCategory error: ", error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}