const {setDefaultCompany, fetchAndFormatCompanies, handleAuthRedirect} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewCategory: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session category: " + companyId)

            try {
                const foodCategoryCounts = await foodCategorySchema.aggregate([{
                    $match: {
                        company_id: new mongoose.Types.ObjectId(companyId),
                        deleted: {$ne: true}
                    }
                }, {
                    $lookup: {
                        from: "food_sub_category", let: {categoryId: "$_id"}, pipeline: [{
                            $match: {
                                $expr: {$eq: ["$food_category_id", "$$categoryId"]}
                            }
                        }, {
                            $group: {
                                _id: null, count: {$sum: 1}
                            }
                        }], as: "subCategoryCount"
                    }
                }, {
                    $project: {
                        _id: "$_id",
                        category_name: "$category_name",
                        is_active: "$is_active",
                        count: {$ifNull: [{$arrayElemAt: ["$subCategoryCount.count", 0]}, 0]}
                    }
                }]);

                // console.log(foodCategoryCounts);

                res.render(`${appPath}/company/master-category.ejs`, {
                    formattedCompanies: formattedCompanies,
                    foodCategory: foodCategoryCounts,
                    companyId: companyId,
                    selectedLegalName: req.session.selectedLegalName,
                    selectedCompanyLogo: req.session.selectedCompanyLogo,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Internal Server Error'});
            }
        } catch (error) {
            console.error("Error in manage-category: ", error);
        }
    }, 
    addCategory: async (req, res) => {
        try {
            const companyId = req.session.selectedCompanyId;
            const categoryName = req.body.category_name;

            const existingData = await foodCategorySchema.findOne({
                category_name: categoryName, 
                company_id: companyId,
                deleted: { $ne: true }
            });

            if (existingData) {
                req.session.Error = "Category with this name already exists";
            } else {
                const newCategory = new foodCategorySchema({
                    category_name: categoryName, 
                    company_id: companyId,
                });

                const result = await newCategory.save();
                if (result) {
                    req.session.Success = "Category added successfully!";
                } else {
                    req.session.Error = "Failed to save category";
                }
            }
            res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error in add-category:", error);
            req.session.Error = "An internal error occurred while adding the category.";
            res.redirect("/company/manage-category");
        }
    }, 
    updateCategory: async (req, res) => {
        try {
            const companyId = req.session.selectedCompanyId;
            const categoryName = req.body.category_name;

            const existingData = await foodCategorySchema.findOne({
                category_name: categoryName,
                company_id: new mongoose.Types.ObjectId(companyId),
                _id: { $ne: new mongoose.Types.ObjectId(req.body.category_id) },
                deleted: { $ne: true }
            });

            if (existingData) {
                req.session.Error = "Another category with this name already exists";
            } else {
                const result = await foodCategorySchema.updateOne(
                    { _id: new mongoose.Types.ObjectId(req.body.category_id) },
                    { $set: { category_name: categoryName } }
                );

                if (result.modifiedCount > 0) {
                    req.session.Success = "Category updated successfully!";
                } else {
                    req.session.Error = "No changes were made or category not found.";
                }
            }
            res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error in update-category:", error);
            req.session.Error = "An internal error occurred while updating the category.";
            res.redirect("/company/manage-category");
        }
    },
    activeAndDeactive: async (req, res) => {
        try {
            const newValue = req.query.value !== 'true';
            const result = await foodCategorySchema.updateOne(
                { _id: new mongoose.Types.ObjectId(req.query.id) },
                { $set: { is_active: newValue } }
            );

            if (result.modifiedCount === 1) {
                req.session.Success = `Category ${newValue ? 'activated' : 'deactivated'} successfully!`;
            } else {
                req.session.Error = "Failed to update category status.";
            }
            res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating category status:", error);
            req.session.Error = "Internal Server Error";
            res.redirect("/company/manage-category");
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const categoryId = req.query.id;
            const result = await foodCategorySchema.updateOne(
                { _id: new mongoose.Types.ObjectId(categoryId) },
                { $set: { is_active: false, deleted: true } }
            );
            if (result.modifiedCount > 0) {
                req.session.Success = "Category deleted successfully!";
                res.status(200).json({ success: true, message: 'Category deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Category not found' });
            }
        } catch (error) {
            console.error("deleteCategory error: ", error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}