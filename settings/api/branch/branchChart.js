const tokenController = require("../../../controller/token-controller");
const mongoose = require("mongoose");
module.exports = {
    bind_Url: function () {
        app.get("/branch/admin-chart-7", async (req, res) => {
            try {
                const branchId = await tokenController.getBranchID(req, res);

                const today = new Date();
                const lastWeekStartDate = new Date(today);
                lastWeekStartDate.setDate(today.getDate() - today.getDay() - 6);
                lastWeekStartDate.setHours(0, 0, 0, 0);

                const lastWeekEndDate = new Date(today);
                lastWeekEndDate.setDate(today.getDate() - today.getDay());
                lastWeekEndDate.setHours(23, 59, 59, 999);

                const result = await orderSchema.aggregate([
                    {
                        $match: {
                            branch_id: new mongoose.Types.ObjectId(branchId),
                            created_at: {
                                $gte: lastWeekStartDate,
                                $lte: lastWeekEndDate
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                dayOfWeek: {$dayOfWeek: "$created_at"}
                            },
                            totalOrders: {$sum: 1}
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            dayOfWeek: "$_id.dayOfWeek",
                            totalOrders: 1
                        }
                    },
                    {
                        $sort: {dayOfWeek: 1}
                    }
                ]);

                const chartData = {
                    categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    series: [{
                        name: 'Total Orders',
                        data: [0, 0, 0, 0, 0, 0, 0]
                    }]
                };

                result.forEach(item => {
                    const dayOfWeek = item.dayOfWeek - 1;
                    chartData.series[0].data[dayOfWeek] = item.totalOrders;
                });

                // console.log(chartData);

                res.status(200).send({success: true, message: 'Data retrieved successfully', chartData});
            } catch (error) {
                res.status(500).send("/branch/dashboard error: " + error.message);
            }
        });

        app.get("/branch/admin-chart-6", async (req, res) => {
            try {
                const branchId = await tokenController.getBranchID(req, res);

                const today = new Date();

                const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);

                const result = await orderSchema.aggregate([// Match orders created within the current month
                    {
                        $match: {
                            branch_id: new mongoose.Types.ObjectId(branchId), created_at: {
                                $gte: startDate, $lte: endDate
                            }
                        }
                    }, {$unwind: '$item'}, {
                        $lookup: {
                            from: 'food_sub_item',
                            localField: 'item.food_sub_item_id',
                            foreignField: '_id',
                            as: 'foodSubItem'
                        }
                    }, {$unwind: '$foodSubItem'}, {
                        $lookup: {
                            from: 'food_item',
                            localField: 'foodSubItem.food_item_id',
                            foreignField: '_id',
                            as: 'foodItem'
                        }
                    }, {$unwind: '$foodItem'}, {
                        $group: {
                            _id: {
                                date: {$dateToString: {format: "%Y-%m-%d", date: "$created_at"}},
                                food_type: '$foodItem.food_type'
                            }, totalQuantity: {$sum: '$item.quantity'}
                        }
                    }, {
                        $project: {
                            _id: {
                                date: '$_id.date', food_type: {
                                    $switch: {
                                        branches: [{
                                            case: {$eq: ['$_id.food_type', 1]},
                                            then: 'Veg'
                                        }, {
                                            case: {$eq: ['$_id.food_type', 2]},
                                            then: 'Egg'
                                        }, {case: {$eq: ['$_id.food_type', 3]}, then: 'Non-Veg'}], default: 'Unknown'
                                    }
                                }
                            }, totalQuantity: 1
                        }
                    }, {
                        $group: {
                            _id: '$_id.date',
                            series: {$push: {food_type: '$_id.food_type', totalQuantity: '$totalQuantity'}}
                        }
                    }, {
                        $project: {
                            _id: 0, date: '$_id', series: {
                                $map: {
                                    input: ['Veg', 'Egg', 'Non-Veg'], as: 'type', in: {
                                        food_type: '$$type', totalQuantity: {
                                            $ifNull: [{
                                                $arrayElemAt: [{
                                                    $filter: {
                                                        input: '$series', cond: {$eq: ['$$this.food_type', '$$type']}
                                                    }
                                                }, 0]
                                            }, {totalQuantity: 0}]
                                        }
                                    }
                                }
                            }
                        }
                    }]);

                const chartData = {
                    categories: result.map(item => item.date), series: result.map(item => ({
                        data: item.series.reduce((acc, val) => {
                            acc[val.food_type] = val.totalQuantity.totalQuantity;
                            return acc;
                        }, {})
                    }))
                };

                // console.log(chartData);

                res.status(200).json(chartData);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send({success: false, message: 'Internal server error'});
            }
        });



    }
}