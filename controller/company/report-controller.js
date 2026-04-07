const {setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const tokenController = require("../token-controller");
module.exports = {
    manageOrder: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);

            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            const companyIds = formattedCompanies.map(c => new mongoose.Types.ObjectId(c._id));

            // Fetch all branches for all companies owned by the user
            const branches = await branchSchema.find({ company_id: { $in: companyIds } })
                .select('_id branch_name company_id');

            const companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            res.render(`${appPath}/company/orders-report.ejs`, {
                formattedCompanies: formattedCompanies,
                branches: branches,
                companyId: companyId,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });

        } catch (error) {
            console.error("Error managing order:", error);
            res.status(500).json({ message: 'Internal server error' });
        }

    },
    fetchOrder: async (req, res) => {
        try {
            const { duration, startDate, endDate, companyId, branchId } = req.query;
            const userId = await tokenController.getUserID(req, res);

            let query = { deleted: false };

            // 1. Date Range Filter
            if (duration && duration !== 'all') {
                let start = new Date();
                let end = new Date();
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                if (duration === 'day') {
                    // Today
                } else if (duration === 'month') {
                    start.setDate(1);
                } else if (duration === 'year') {
                    start.setMonth(0, 1);
                } else if (duration === 'calendar') { // Assuming 'calendar' or 'custom'
                    if (startDate && endDate) {
                        start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                    }
                }
                query.created_at = { $gte: start, $lte: end };
            }

            // 2. Company & Branch Filter
            if (branchId && branchId !== 'all') {
                query.branch_id = new mongoose.Types.ObjectId(branchId);
            } else if (companyId && companyId !== 'all') {
                const branches = await branchSchema.find({ company_id: new mongoose.Types.ObjectId(companyId) }).select('_id');
                const branchIds = branches.map(b => b._id);
                query.branch_id = { $in: branchIds };
            } else {
                const companies = await companySchema.find({ user_id: new mongoose.Types.ObjectId(userId) }).select('_id');
                const companyIds = companies.map(c => c._id);
                const branches = await branchSchema.find({ company_id: { $in: companyIds } }).select('_id');
                const branchIds = branches.map(b => b._id);
                query.branch_id = { $in: branchIds };
            }

            const orders = await orderSchema.find(query)
                .populate({
                    path: 'table_id',
                    select: 'table_name'
                })
                .populate({
                    path: 'branch_id',
                    select: 'branch_name company_id',
                    populate: {
                        path: 'company_id',
                        select: 'company_name'
                    }
                })
                .sort({ created_at: -1 });

            const formattedOrders = orders.map(order => ({
                bill_no: order.bill_no,
                table_name: order.table_id ? order.table_id.table_name : 'N/A',
                company_name: (order.branch_id && order.branch_id.company_id) ? order.branch_id.company_id.company_name : 'N/A',
                branch_name: order.branch_id ? order.branch_id.branch_name : 'N/A',
                total_price: order.total_price,
                payment_mode: ['online', 'card', 'cash', 'other'][order.payment_mode - 1] || 'N/A',
                created_at: order.created_at.toLocaleString()
            }));

            res.json({ success: true, data: formattedOrders });
        } catch (error) {
            console.error("Error fetching filtered orders:", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    revenueReport: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);
            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            const companyIds = formattedCompanies.map(c => new mongoose.Types.ObjectId(c._id));
            const branches = await branchSchema.find({ company_id: { $in: companyIds } })
                .select('_id branch_name company_id');
            const companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            res.render(`${appPath}/company/revenue-report.ejs`, {
                formattedCompanies: formattedCompanies,
                branches: branches,
                companyId: companyId,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });
        } catch (error) {
            console.error("Error revenue report:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    itemRevenueReport: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);
            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            const companyIds = formattedCompanies.map(c => new mongoose.Types.ObjectId(c._id));
            const branches = await branchSchema.find({ company_id: { $in: companyIds } })
                .select('_id branch_name company_id');
            const companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            res.render(`${appPath}/company/item-revenue-report.ejs`, {
                formattedCompanies: formattedCompanies,
                branches: branches,
                companyId: companyId,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });
        } catch (error) {
            console.error("Error item revenue report:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getRevenueData: async (req, res) => {
        try {
            const { duration, startDate, endDate, companyId, branchId } = req.query;
            const userId = await tokenController.getUserID(req, res);

            let matchQuery = { deleted: false };

            if (duration && duration !== 'all') {
                let start = new Date();
                let end = new Date();
                start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
                if (duration === 'day') { }
                else if (duration === 'month') start.setDate(1);
                else if (duration === 'year') start.setMonth(0, 1);
                else if (duration === 'calendar' && startDate && endDate) {
                    start = new Date(startDate); start.setHours(0, 0, 0, 0);
                    end = new Date(endDate); end.setHours(23, 59, 59, 999);
                }
                matchQuery.created_at = { $gte: start, $lte: end };
            }

            if (branchId && branchId !== 'all') {
                matchQuery.branch_id = new mongoose.Types.ObjectId(branchId);
            } else {
                let targetCompanyIds = [];
                if (companyId && companyId !== 'all') {
                    targetCompanyIds = [new mongoose.Types.ObjectId(companyId)];
                } else {
                    const companies = await companySchema.find({ user_id: new mongoose.Types.ObjectId(userId) }).select('_id');
                    targetCompanyIds = companies.map(c => c._id);
                }
                const branches = await branchSchema.find({ company_id: { $in: targetCompanyIds } }).select('_id');
                matchQuery.branch_id = { $in: branches.map(b => b._id) };
            }

            const orders = await orderSchema.find(matchQuery)
                .populate({
                    path: 'branch_id',
                    select: 'branch_name company_id',
                    populate: { path: 'company_id', select: 'company_name' }
                })
                .sort({ created_at: -1 });

            const summaryMap = {};
            orders.forEach(order => {
                const key = order.branch_id ? order.branch_id._id.toString() : 'unknown';
                if (!summaryMap[key]) {
                    summaryMap[key] = {
                        branch_name: order.branch_id ? order.branch_id.branch_name : 'Unknown',
                        company_name: (order.branch_id && order.branch_id.company_id) ? order.branch_id.company_id.company_name : 'Unknown',
                        total_orders: 0,
                        total_revenue: 0,
                    };
                }
                summaryMap[key].total_orders += 1;
                summaryMap[key].total_revenue += order.total_price;
            });

            res.json({ success: true, data: Object.values(summaryMap) });
        } catch (error) {
            console.error("Error fetching revenue data:", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    getItemRevenueData: async (req, res) => {
        try {
            const { duration, startDate, endDate, companyId, branchId } = req.query;
            const userId = await tokenController.getUserID(req, res);

            let matchQuery = { deleted: false };
            if (duration && duration !== 'all') {
                let start = new Date(); let end = new Date();
                start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
                if (duration === 'day') { }
                else if (duration === 'month') start.setDate(1);
                else if (duration === 'year') start.setMonth(0, 1);
                else if (duration === 'calendar' && startDate && endDate) {
                    start = new Date(startDate); start.setHours(0, 0, 0, 0);
                    end = new Date(endDate); end.setHours(23, 59, 59, 999);
                }
                matchQuery.created_at = { $gte: start, $lte: end };
            }

            if (branchId && branchId !== 'all') {
                matchQuery.branch_id = new mongoose.Types.ObjectId(branchId);
            } else {
                let targetCompanyIds = [];
                if (companyId && companyId !== 'all') {
                    targetCompanyIds = [new mongoose.Types.ObjectId(companyId)];
                } else {
                    const companies = await companySchema.find({ user_id: new mongoose.Types.ObjectId(userId) }).select('_id');
                    targetCompanyIds = companies.map(c => c._id);
                }
                const branches = await branchSchema.find({ company_id: { $in: targetCompanyIds } }).select('_id');
                matchQuery.branch_id = { $in: branches.map(b => b._id) };
            }

            const aggregation = [
                { $match: matchQuery },
                { $unwind: "$item" },
                { $group: {
                    _id: "$item.food_sub_item_id",
                    totalQuantity: { $sum: "$item.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$item.quantity", "$item.price"] } }
                }},
                { $lookup: {
                    from: "food_sub_item",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subItem"
                }},
                { $unwind: "$subItem" },
                { $lookup: {
                    from: "food_item",
                    localField: "subItem.food_item_id",
                    foreignField: "_id",
                    as: "foodItem"
                }},
                { $unwind: "$foodItem" },
                { $project: {
                    _id: 1,
                    item_name: "$foodItem.item_name",
                    sub_item_name: "$subItem.sub_item_name",
                    totalQuantity: 1,
                    totalRevenue: 1,
                    avgPrice: { $divide: ["$totalRevenue", "$totalQuantity"] }
                }},
                { $sort: { totalRevenue: -1 } }
            ];

            const result = await orderSchema.aggregate(aggregation);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error("Error fetching item revenue data:", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
