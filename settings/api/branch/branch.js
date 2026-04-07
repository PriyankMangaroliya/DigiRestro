const tokenController = require("../../../controller/token-controller");
const mongoose = require("mongoose");
const {handleAuthRedirect} = require("../../../controller/company/company-helper");

module.exports = {
    bind_Url: function () {
        app.get("/branch/dashboard", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchDashboardController.dashboard(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/dashboard error: ", error);
            }
        });

        app.get("/branch/profile", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchProfileController.branchProfileDetails(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/dashboard error: ", error);
            }
        });

        app.post("/branch/change-password", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    changePasswordController.changePassword(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/dashboard error: ", error);
            }

        });

        app.get("/branch/master-area", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchAreaController.viewArea(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/master-area error: ", error);
            }
        });

        app.post("/branch/add-area", async (req, res) => {
            console.log(req.body)
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchAreaController.addArea(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/add-area error: ", error);
            }
        });

        app.post("/branch/update-area", async (req, res) => {
            // console.log(req.body)
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchAreaController.updateArea(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/update-area error: ", error);
            }
        });

        app.get("/branch/area-activeAndDeactive", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchAreaController.activeAndDeactive(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/area-activeAndDeactive error: ", error);
            }
        });

        app.post("/branch/delete-area", async (req, res) => {
            try {
                //Check logged-in user
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchAreaController.deleteArea(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/delete-table error: ", error);
            }
        });

        app.get("/branch/master-table", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchTableController.viewTable(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/master-table error: ", error);
            }
        });

        app.post("/branch/add-table", async (req, res) => {
            console.log(req.body)
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchTableController.addTable(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/add-table error: ", error);
            }
        });

        app.post("/branch/update-table", async (req, res) => {
            // console.log(req.body)
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchTableController.updateTableOfArea(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/update-table error: ", error);
            }
        });

        app.get("/branch/table-activeAndDeactive", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchTableController.activeAndDeactive(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/table-activeAndDeactive error: ", error);
            }
        });

        app.post("/branch/delete-table", async (req, res) => {
            try {
                //Check logged-in user
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    branchTableController.deleteTables(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/delete-table error: ", error);
            }
        });

        app.get("/branch/assign-table", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    assignTableController.viewAssignTable(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/assign-table error: ", error);
            }
        });

        app.get("/branch/master-order/", async (req, res) => {

            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.itemOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/master-order error: ", error);
            }
        });

        app.post('/branch/add-order', async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.addOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/add-order error: ", error);
            }
        });

        app.post('/branch/update-order', async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.updateOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/update-order error: ", error);
            }
        });

        app.get("/branch/view-order", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.ViewOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/order error: ", error);
            }
        });

        app.get("/branch/manage-order", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.manageOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/manage-order error: ", error);
            }
        });

        app.get("/branch/view-kot", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    kotController.viewKot(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/view-kot error: ", error);
            }
        });

        app.post('/updateItemStatus', async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {

                    const orderId = req.body.orderId;
                    const items = req.body.items;

                    console.log(orderId);
                    console.log(items);

                    const itemIds = JSON.parse(items);

                    const result = await orderSchema.updateOne({
                            _id: orderId, "item._id": {$in: itemIds}
                        }, {$set: {"item.$[].itemStatus": 3, "status": 1}},

                        {multi: true} // Adding this option to update all matching elements
                    );

                    console.log(result)

                    if (result.nModified === 0) {
                        return res.status(404).json({message: 'No items were updated'});
                    }

                    res.status(200).send({
                        success: true,
                    });

                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/updateItemStatus error: ", error);
            }
        });

        app.delete('/order-removeItem', async (req, res) => {
            try {
                const {orderId, itemId} = req.body;

                const order = await orderSchema.findById(orderId);

                // console.log(order)
                if (!order) {
                    console.log('Order not found');
                    return res.status(404).send('Order not found');
                }

                const item = order.item.find(item => item._id.toString() === itemId);

                if (!item) {
                    console.log('Item not found in order');
                    return res.status(404).send('Item not found in order');
                }

                // console.log('Original item:', item);

                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    order.item = order.item.filter(i => i._id.toString() !== itemId);
                }

                // console.log('Modified item:', item);

                order.total_price = order.item.reduce((total, currentItem) => {
                    return total + (currentItem.quantity * currentItem.price);
                }, 0);

                // console.log('Updated order total price:', order.total_price);

                await order.save();

                // const remainingItems = order.item.length;

                // console.log(remainingItems)

                res.status(200).json({success: true, msg: 'Item removed successfully'});
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            }
        });
        app.get('/branch/print', async (req, res) => {

            try {
                const callback = await tokenController.auth(req, res);

                if (callback.callback && _.isEqual(callback.role_name, "B")) {
                    orderController.printOrder(req, res);
                } else {
                    res.redirect("/home/auth-login");
                }
            } catch (error) {
                res.send("/branch/order error: ", error);
            }
        })

        app.get('/food-subcategories/:categoryId', async (req, res) => {
            try {
                const categoryId = req.params.categoryId;
                const subcategories = await foodSubCategorySchema.find({food_category_id: categoryId});
                // console.log(subcategories)
                res.json(subcategories);
            } catch (error) {
                console.error("Error fetching subcategories:", error);
                res.status(500).json({message: "Internal Server Error"});
            }
        });

        app.get('/food-items/:subcategoryId', async (req, res) => {
            try {
                const subcategoryId = req.params.subcategoryId;

                // Fetch food items belonging to the selected subcategory
                const foodItems = await foodItemSchema.find({food_sub_category_id: subcategoryId, is_active: true});

                res.json(foodItems);
            } catch (error) {
                console.error("Error fetching food items:", error);
                res.status(500).json({message: "Internal Server Error"});
            }
        });

        app.get('/food-details/:id', async (req, res) => {
            try {
                const foodSubItemId = req.params.id;


                // console.log(foodSubItemId)
                const foodSubItem = await foodSubItemSchema.find({food_item_id: foodSubItemId});

                if (!foodSubItem) {
                    return res.status(404).json({message: 'Food sub-item not found'});
                }

                // console.log(foodSubItem)


                res.json(foodSubItem);
            } catch (error) {
                console.error("Error fetching food sub-item details:", error);
                res.status(500).json({message: 'Internal server error'});
            }
        });

        app.get('/food-sub-item/:id', async (req, res) => {
            try {
                const foodSubItemId = req.params.id;
                // console.log(foodSubItemId)
                // const foodSubItem = await foodSubItemSchema.find({_id: foodSubItemId});

                const foodSubItem = await foodSubItemSchema.find({_id: foodSubItemId})
                    .populate({
                        path: 'food_item_id',
                        model: 'food_item',
                        select: 'item_name', // Select item_name directly from the food_item model
                    })
                    .select('sub_item_name price');

                if (!foodSubItem) {
                    return res.status(404).json({message: 'Food sub-item not found'});
                }

                // Convert Mongoose document to plain JavaScript object (lean)
                // const foodSubItemObject = foodSubItem;
                //
                // // Extract item_name from food_item_id and remove _id
                // if (foodSubItemObject.food_item_id) {
                //     foodSubItemObject.item_name = foodSubItemObject.food_item_id.item_name;
                //     delete foodSubItemObject.food_item_id;
                // }

                console.log(foodSubItem)
                res.json(foodSubItem);
            } catch (error) {
                console.error("Error fetching food sub-item details:", error);
                res.status(500).json({message: 'Internal server error'});
            }
        });

        app.get("/branch/logout", async (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).json({error: "Internal Server Error"});
                }

                // Clear the session cookie
                res.clearCookie("jwt");

                console.log("'Logout successful'");
                isDefaultCompanySet = true;
                // res.json({ message: 'Logout successful' });
                res.redirect("/home/auth-login");
            });
        });
    }
}