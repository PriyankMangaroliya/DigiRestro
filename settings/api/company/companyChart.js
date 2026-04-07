module.exports = {
    bind_Url: function () {
        async function getCompanyBranches(companyId) {
            return await branchSchema.find({ company_id: companyId }, { _id: 1, branch_name: 1 }).exec();
        }

        async function calculateRevenue(branchIds, startDate, endDate) {
            const result = await orderSchema.aggregate([
                {
                    $match: {
                        branch_id: { $in: branchIds },
                        created_at: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_price: { $sum: '$total_price' }
                    }
                }
            ]).exec();
            return result.length > 0 ? result[0].total_price : 0;
        }

        function calculatePercentageChange(current, previous) {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }
            return parseFloat(((current - previous) / previous * 100).toFixed(2));
        }

        app.get("/company/today", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const branches = await getCompanyBranches(companyId);
                const branchIds = branches.map(b => b._id);

                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
                const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

                const currentRevenue = await calculateRevenue(branchIds, startOfDay, endOfDay);
                const previousRevenue = await calculateRevenue(branchIds, startOfYesterday, endOfYesterday);

                const percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);

                res.status(200).send({
                    success: true,
                    revenueData: currentRevenue,
                    percentageChange: Math.abs(percentageChange),
                    status: percentageChange >= 0 ? "Increase" : "Decrease"
                });
            } catch (error) {
                console.error("Error fetching today revenue:", error);
                res.status(500).send("Error");
            }
        });

        app.get("/company/currentWeek", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const branches = await getCompanyBranches(companyId);
                const branchIds = branches.map(b => b._id);

                const now = new Date();
                const day = now.getDay();
                const startOfThisWeek = new Date(now);
                startOfThisWeek.setDate(now.getDate() - day);
                startOfThisWeek.setHours(0, 0, 0, 0);

                const startOfLastWeek = new Date(startOfThisWeek);
                startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
                const endOfLastWeek = new Date(startOfThisWeek);
                endOfLastWeek.setMilliseconds(-1);

                const currentRevenue = await calculateRevenue(branchIds, startOfThisWeek, now);
                const previousRevenue = await calculateRevenue(branchIds, startOfLastWeek, endOfLastWeek);

                const percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);

                res.status(200).send({
                    success: true,
                    revenueData: currentRevenue,
                    percentageChange: Math.abs(percentageChange),
                    status: percentageChange >= 0 ? "Increase" : "Decrease"
                });
            } catch (error) {
                console.error("Error fetching week revenue:", error);
                res.status(500).send("Error");
            }
        });

        app.get("/company/currentMonth", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const branches = await getCompanyBranches(companyId);
                const branchIds = branches.map(b => b._id);

                const now = new Date();
                const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
                const endOfLastMonth = new Date(startOfThisMonth);
                endOfLastMonth.setMilliseconds(-1);

                const currentRevenue = await calculateRevenue(branchIds, startOfThisMonth, now);
                const previousRevenue = await calculateRevenue(branchIds, startOfLastMonth, endOfLastMonth);

                const percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);

                res.status(200).send({
                    success: true,
                    revenueData: currentRevenue,
                    percentageChange: Math.abs(percentageChange),
                    status: percentageChange >= 0 ? "Increase" : "Decrease"
                });
            } catch (error) {
                console.error("Error fetching month revenue:", error);
                res.status(500).send("Error");
            }
        });

        app.get("/company/currentYear", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const branches = await getCompanyBranches(companyId);
                const branchIds = branches.map(b => b._id);

                const now = new Date();
                const startOfThisYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);

                const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
                const endOfLastYear = new Date(startOfThisYear);
                endOfLastYear.setMilliseconds(-1);

                const currentRevenue = await calculateRevenue(branchIds, startOfThisYear, now);
                const previousRevenue = await calculateRevenue(branchIds, startOfLastYear, endOfLastYear);

                const percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);

                res.status(200).send({
                    success: true,
                    revenueData: currentRevenue,
                    percentageChange: Math.abs(percentageChange),
                    status: percentageChange >= 0 ? "Increase" : "Decrease"
                });
            } catch (error) {
                console.error("Error fetching year revenue:", error);
                res.status(500).send("Error");
            }
        });

        app.get("/company/allBranchesRevenue", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const selectedYear = parseInt(req.query.year) || new Date().getFullYear();
                const branches = await getCompanyBranches(companyId);

                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = (selectedYear === currentYear) ? now.getMonth() + 1 : 12;

                const monthWiseTotals = [];

                for (const branch of branches) {
                    const branchMonthWiseTotals = new Array(currentMonth).fill(0);

                    for (let month = 1; month <= currentMonth; month++) {
                        const startOfMonth = new Date(selectedYear, month - 1, 1);
                        const endOfMonth = new Date(selectedYear, month, 0, 23, 59, 59);

                        const total_price = await calculateRevenue([branch._id], startOfMonth, endOfMonth);
                        branchMonthWiseTotals[month - 1] = total_price;
                    }

                    monthWiseTotals.push({ name: branch.branch_name, data: branchMonthWiseTotals });
                }

                res.status(200).send({ success: true, monthWiseTotals });
            } catch (error) {
                console.error("Error in allBranchesRevenue:", error);
                res.status(500).send("Error");
            }
        });

        app.get("/company/paymentMode", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;
                const selectedYear = parseInt(req.query.year) || new Date().getFullYear();
                const branches = await getCompanyBranches(companyId);
                const branchIds = branches.map(b => b._id);

                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = (selectedYear === currentYear) ? now.getMonth() + 1 : 12;

                const paymentModes = { 1: "Online", 2: "Card", 3: "Cash", 4: "Other" };
                const paymentModeData = [];

                for (const modeNumber in paymentModes) {
                    const modeName = paymentModes[modeNumber];
                    const data = new Array(currentMonth).fill(0);

                    for (let month = 1; month <= currentMonth; month++) {
                        const startOfMonth = new Date(selectedYear, month - 1, 1);
                        const endOfMonth = new Date(selectedYear, month, 0, 23, 59, 59);

                        const result = await orderSchema.aggregate([
                            {
                                $match: {
                                    payment_mode: parseInt(modeNumber),
                                    branch_id: { $in: branchIds },
                                    created_at: { $gte: startOfMonth, $lte: endOfMonth }
                                }
                            },
                            { $group: { _id: null, total: { $sum: '$total_price' } } }
                        ]).exec();

                        data[month - 1] = result.length > 0 ? result[0].total : 0;
                    }
                    paymentModeData.push({ name: modeName, data: data });
                }

                res.status(200).send({ success: true, paymentMode: paymentModeData });
            } catch (error) {
                console.error("Error in paymentMode:", error);
                res.status(500).send("Error");
            }
        });
    }
}
