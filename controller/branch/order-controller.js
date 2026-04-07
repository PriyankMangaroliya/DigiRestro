const tokenController = require("../token-controller");
const mongoose = require("mongoose");
module.exports = {
    manageOrder: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const orders = await orderSchema.find({
                branch_id: new mongoose.Types.ObjectId(branchId),
            })
                .populate({
                    path: 'table_id',
                    select: 'table_name'
                })
                .populate({
                    path: 'item.food_sub_item_id',
                    model: 'food_sub_item',
                    select: 'sub_item_name food_item_id',
                    populate: {
                        path: 'food_item_id',
                        model: 'food_item',
                        select: 'item_name'
                    }
                });

            // console.log(orders)

            const orderData = orders.map(order => ({
                _id: order._id,
                bill_no: order.bill_no,
                branch_id: order.branch_id,
                table_id: {
                    _id: order.table_id._id,
                    table_name: order.table_id.table_name
                },
                item: order.item.map(item => ({
                    food_sub_item_id: {
                        _id: item.food_sub_item_id._id,
                        sub_item_name: item.food_sub_item_id.sub_item_name,
                        item_name: item.food_sub_item_id.food_item_id.item_name
                    },
                    quantity: item.quantity,
                    itemStatus: item.itemStatus,
                    price: item.price,
                    created_at: item.created_at,
                    _id: item._id
                })),
                total_price: order.total_price,
                payment_mode: order.payment_mode,
                created_at: order.created_at
            }));

            console.log(orderData[0].item[0].food_sub_item_id.item_name)

            res.render(`${appPath}/branch/manage-order.ejs`, {orderData});
        } catch (error) {
            console.error("Error managing order:", error);
            res.status(500).json({message: 'Internal server error'});
        }
    },
    itemOrder: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const {code, table_id} = req.query;

            const {company_id} = await branchSchema.findById(branchId);

            const categories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(company_id), is_active: true
            })

            if (code == 1) {
                order_id = req.query.order_id;
            } else {
                order_id = 'null'
            }

            res.render(`${appPath}/branch/master-order.ejs`, {
                categories, table_id, order_id, code
            });
        } catch (error) {
            console.error("Error in /branch/viewOrder:", error);
        }

    },
    addOrder: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);
            const {table_id, items, total_price, statusCode, orderID} = req.body[0];

            // console.log(req.body[0])

            if (_.isNull(orderID)) {
                const lastOrder = await orderSchema.findOne({branch_id: branchId}).sort({_id: -1}).select('bill_no').exec();
                let billNo;

                if (lastOrder) {
                    billNo = lastOrder.bill_no + 1;
                } else {
                    billNo = 1;
                }
                const itemData = [];

                // console.log(req.body[0].items)
                req.body[0].items.forEach(item => {
                    const {food_sub_item_id, quantity, price} = item;
                    const ItemStatus = req.body[0].statusCode;
                    // console.log(ItemStatus)
                    itemData.push({
                        food_sub_item_id: food_sub_item_id,
                        quantity: quantity,
                        price: price,
                        itemStatus: ItemStatus
                    });
                });

                // console.log(req.body[0].items)
                const newOrder = new orderSchema({
                    bill_no: billNo,
                    branch_id: branchId,
                    table_id: table_id,
                    item: itemData,
                    total_price: req.body[0].total_price,
                    status: statusCode
                });
                //
                console.log(newOrder)
                //
                const result = await newOrder.save();
                if (!result) {
                    res.status(200).send({
                        success: false,
                    });
                    console.log("data can't insert into database")
                } else {
                    res.status(200).send({
                        success: true,
                    });
                    console.log("order added successfully")
                }
            } else {
                const existingOrder = await orderSchema.findById(req.body[0].orderID);

                console.log(existingOrder)
                const userInput = req.body[0];

                if (userInput.statusCode !== 1) {
                    existingOrder.item.forEach(item => {
                        if (item.itemStatus === 1) {
                            item.itemStatus = userInput.statusCode;
                        }
                    });
                }

                console.log(userInput)
                const updatedTotalPrice = existingOrder.total_price + userInput.total_price;

                console.log(updatedTotalPrice)
                for (const item of userInput.items) {
                    existingOrder.item.push({
                        food_sub_item_id: item.food_sub_item_id,
                        quantity: item.quantity,
                        price: item.price,
                        itemStatus: userInput.statusCode,
                        created_at: new Date(),
                    });
                }

                existingOrder.total_price = updatedTotalPrice;
                existingOrder.status = userInput.statusCode;

                const savedOrder = await existingOrder.save();

                if (!savedOrder) {
                    res.status(200).send({
                        success: false,
                    });
                    console.log("data can't insert into database")
                } else {
                    res.status(200).send({
                        success: true,
                    });
                    console.log("order added successfully")
                }
            }

        } catch (error) {
            console.error("Error adding order:", error);
            res.status(500).json({message: 'Internal server error'});
        }

    },
    ViewOrder: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const {code, table_id} = req.query;

            const {company_id} = await branchSchema.findById(branchId);

            const categories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(company_id), is_active: true
            })

            const order_id = req.query.order_id;

            const result = await orderSchema.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(order_id)
                    }
                },
                {
                    $unwind: "$item" // Unwind the item array
                },
                {
                    $lookup: {
                        from: "food_sub_item",
                        localField: "item.food_sub_item_id",
                        foreignField: "_id",
                        as: "joined_item",
                    },
                },
                {
                    $unwind: "$joined_item"
                },
                {
                    $lookup: {
                        from: "food_item",
                        localField: "joined_item.food_item_id",
                        foreignField: "_id",
                        as: "joined_food_item",
                    },
                },
                {
                    $unwind: "$joined_food_item"
                },
                {
                    $group: {
                        _id: "$_id",
                        branch_id: {$first: "$branch_id"},
                        table_id: {$first: "$table_id"},
                        created_at: {$first: "$created_at"},
                        items: {
                            $push: {
                                _id: "$item._id",
                                food_sub_item_id: "$joined_item._id",
                                quantity: "$item.quantity",
                                sub_item_name: "$joined_item.sub_item_name",
                                price: "$joined_item.price",
                                itemStatus: "$item.itemStatus",
                                created_at: "$item.created_at",
                                // Include the item_name from the food_item model
                                item_name: "$joined_food_item.item_name"
                            }
                        },
                        status: {$first: "$status"},
                        total_price: {$first: "$total_price"},
                        payment_mode: {$first: "$payment_mode"}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        branch_id: 1,
                        table_id: 1,
                        created_at: 1,
                        items: 1,
                        status: 1,
                        total_price: 1,
                        payment_mode: 1
                    }
                }
            ]);

            console.log(result[0].items)

            res.render(`${appPath}/branch/order.ejs`, {
                categories, table_id, order: result, code
            });


        } catch (error) {
            console.error("Error in /branch/viewOrder:", error);
        }
    },
    printOrder: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const order_id = req.query.order_id;

            const orders = await orderSchema.find({
                _id: new mongoose.Types.ObjectId(order_id),
                branch_id: new mongoose.Types.ObjectId(branchId),
            })
                .populate({
                    path: 'table_id',
                    select: 'table_name'
                })
                .populate({
                    path: 'item.food_sub_item_id',
                    model: 'food_sub_item',
                    select: 'sub_item_name food_item_id',
                    populate: {
                        path: 'food_item_id',
                        model: 'food_item',
                        select: 'item_name'
                    }
                });

            // console.log(orders)

            const kotData = orders.map(order => ({
                _id: order._id,
                bill_no: order.bill_no,
                branch_id: order.branch_id,
                table_id: {
                    _id: order.table_id._id,
                    table_name: order.table_id.table_name
                },
                item: order.item.map(item => ({
                    food_sub_item_id: {
                        _id: item.food_sub_item_id._id,
                        sub_item_name: item.food_sub_item_id.sub_item_name,
                        item_name: item.food_sub_item_id.food_item_id.item_name
                    },
                    quantity: item.quantity,
                    itemStatus: item.itemStatus,
                    price: item.price,
                    created_at: item.created_at,
                    _id: item._id
                })),
                total_price: order.total_price,
                payment_mode: order.payment_mode,
                created_at: order.created_at
            }));

            // console.log(kotData[0].item)

            res.render(`${appPath}/branch/bill.ejs`, {
                order: kotData,
            });

        } catch (error) {
            console.error("Error in /branch/viewOrder:", error);
        }
    },
    updateOrder: async (req, res) => {
        try {
            const {orderID} = req.body[0]
            const order1 = await orderSchema.findOne({_id: new mongoose.Types.ObjectId(orderID)});

            const inputData = req.body[0];

            const orderItems = order1.item;

            const finalItems = [];

            for (const inputItem of inputData.items) {
                let matched = false;
                const ItemStatus = req.body[0].statusCode;
                for (const orderItem of orderItems) {
                    if (orderItem.food_sub_item_id.toString() === inputItem.food_sub_item_id) {
                        if (orderItem.quantity === inputItem.quantity) {
                            // If quantities match, do nothing
                        } else {
                            // If quantities don't match, adjust quantity and add to finalItems
                            finalItems.push({
                                food_sub_item_id: inputItem.food_sub_item_id,
                                quantity: inputItem.quantity - orderItem.quantity,
                                price: inputItem.price,
                                created_at: orderItem.created_at
                            });
                            console.log("Quantity not matched");
                        }

                        matched = true;
                        break;
                    }
                }

                // If item not found in order, add to finalItems
                if (!matched) {
                    finalItems.push(inputItem);
                }
            }

            // Construct the final output object
            const finalOutput = {
                items: finalItems, total_price: inputData.total_price, statusCode: inputData.statusCode
            };

            const ItemStatus = req.body[0].statusCode;
            // Update the order in the database for each item
            for (const item of finalOutput.items) {
                const newItem = {
                    food_sub_item_id: item.food_sub_item_id,
                    quantity: item.quantity,
                    price: item.price,
                    itemStatus: ItemStatus,
                    created_at: item.created_at
                };

                await orderSchema.findOneAndUpdate({_id: new mongoose.Types.ObjectId(orderID)}, {$push: {item: newItem}}, {new: true});
            }

            await orderSchema.findOneAndUpdate({_id: new mongoose.Types.ObjectId(orderID)}, {
                total_price: finalOutput.total_price,
                status: finalOutput.statusCode
            }, {new: true});


            if (inputData.paymentMode) {
                await orderSchema.findOneAndUpdate({_id: new mongoose.Types.ObjectId(orderID)}, {payment_mode: inputData.paymentMode}, {new: true});
            }

            // console.log("this is update")
            res.status(200).send({
                success: true,
            });
        } catch (error) {
            console.error("Error adding order:", error);
            res.status(500).json({message: 'Internal server error'});
        }
    }
}