const { handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies } = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewFood: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session master-food: " + companyId)

            // Fetch food categories for the company
            const foodCategories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(companyId), is_active: true
            });

            // console.log("foodCategories: " +foodCategories)

            // Fetch food subcategories based on food categories
            const foodSubCategories = await foodSubCategorySchema.find({
                food_category_id: { $in: foodCategories.map(category => category._id) }, is_active: true
            });

            // console.log("foodSubCategories: " +foodSubCategories)

            // Fetch food items based on food subcategories
            const foodItems = await foodItemSchema.find({
                food_sub_category_id: { $in: foodSubCategories.map(subCategory => subCategory._id) }
            });

            // console.log("fooditem: " +foodItems)

            // Fetch food sub items based on food items
            const foodSubItems = await foodSubItemSchema.find({
                food_item_id: { $in: foodItems.map(item => item._id) }
            });

            // console.log("foodsubitem: " + foodSubItems)

            res.render(`${appPath}/company/master-food.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                foodSubCategories: foodSubCategories,
                foodItems: foodItems,
                foodSubItems: foodSubItems,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });

        } catch (error) {
            console.error("Error in /company/master-food:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    addFoodItem: async (req, res) => {
        try {
            const foodItemData = {
                item_name: req.body.item_name,
                description: req.body.description,
                food_sub_category_id: new mongoose.Types.ObjectId(req.body.food_sub_category_id),
                food_type: parseInt(req.body.food_type),
                is_active: true,
            };

            const newFoodItem = new foodItemSchema(foodItemData);
            const savedFoodItem = await newFoodItem.save();

            const noOfSubFood = parseInt(req.body.no_of_sub_food);
            for (let i = 1; i <= noOfSubFood; i++) {
                const subItemData = {
                    sub_item_name: req.body[`sub_item_name_${i}`],
                    price: parseFloat(req.body[`price_${i}`]),
                    food_item_id: new mongoose.Types.ObjectId(savedFoodItem._id),
                    is_active: true,
                };

                const newFoodSubItem = new foodSubItemSchema(subItemData);
                await newFoodSubItem.save();
            }

            req.session.Success = "Food item and sub-items added successfully!";
            res.redirect("/company/manage-food");
        } catch (error) {
            console.error("Error in addFoodItem:", error);
            req.session.Error = "An error occurred while adding the food item.";
            res.redirect("/company/manage-food");
        }
    },
    activeAndDeactive: async (req, res) => {
        try {
            const newValue = req.query.value !== 'true';
            const result = await foodItemSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(req.query.id) },
                { $set: { is_active: newValue } }
            );

            if (result.modifiedCount === 1) {
                req.session.Success = `Food item ${newValue ? 'activated' : 'deactivated'} successfully!`;
            } else {
                req.session.Error = "Failed to update food item status.";
            }
            res.redirect("/company/manage-food");
        } catch (error) {
            console.error("Error updating food item status:", error);
            req.session.Error = "Internal Server Error";
            res.redirect("/company/manage-food");
        }
    },
    updateFoodItem: async (req, res) => {
        try {
            const foodItemId = req.body.food_item_id;
            const updateData = {
                item_name: req.body.item_name,
                description: req.body.description,
                food_sub_category_id: new mongoose.Types.ObjectId(req.body.food_sub_category_id),
                food_type: parseInt(req.body.food_type),
                updated_at: new Date()
            };

            await foodItemSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(foodItemId) },
                { $set: updateData }
            );

            // Delete existing sub-items and re-add them (simplest way to handle varying lengths)
            await foodSubItemSchema.deleteMany({ food_item_id: new mongoose.Types.ObjectId(foodItemId) });

            const noOfSubFood = parseInt(req.body.no_of_sub_food);
            for (let i = 1; i <= noOfSubFood; i++) {
                const subItemData = {
                    sub_item_name: req.body[`sub_item_name_${i}`],
                    price: parseFloat(req.body[`price_${i}`]),
                    food_item_id: new mongoose.Types.ObjectId(foodItemId),
                    is_active: true,
                };

                const newFoodSubItem = new foodSubItemSchema(subItemData);
                await newFoodSubItem.save();
            }

            req.session.Success = "Food item and variants updated successfully!";
            res.redirect("/company/manage-food");
        } catch (error) {
            console.error("updateFoodItem error: ", error);
            req.session.Error = "An error occurred while updating the food item.";
            res.redirect("/company/manage-food");
        }
    },
    deleteFoodItem: async (req, res) => {
        try {
            const foodItemId = req.query.id;
            const result = await foodItemSchema.deleteOne({ _id: new mongoose.Types.ObjectId(foodItemId) });

            if (result.deletedCount > 0) {
                // Also hard delete all related sub-items
                await foodSubItemSchema.deleteMany({ food_item_id: new mongoose.Types.ObjectId(foodItemId) });

                req.session.Success = "Food item deleted successfully!";
                res.status(200).json({ success: true, message: 'Food item deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Food item not found' });
            }
        } catch (error) {
            console.error("deleteFoodItem error: ", error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}