const {handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY
});


module.exports = {
    viewBranch: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);
            //
            // const branch = await branchSchema.find({company_id: new mongoose.Types.ObjectId(companyId)})

            const result = await branchSchema.aggregate([
                { $match: { "company_id": new mongoose.Types.ObjectId(companyId) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: "purchase_subscription",
                        localField: "_id",
                        foreignField: "branch_id",
                        as: "sub"
                    }
                },
                { $unwind: { path: "$sub", preserveNullAndEmptyArrays: true } },
                { $sort: { "sub._id": -1 } },
                {
                    $group: {
                        _id: "$_id",
                        branch_name: { $first: "$branch_name" },
                        userName: { $first: "$user.name" },
                        userEmail: { $first: "$user.email_id" },
                        userMobile: { $first: "$user.mobile_no" },
                        is_active: { $first: "$sub.is_active" },
                        start_date: { $first: "$sub.start_date" },
                        end_date: { $first: "$sub.end_date" },
                        plan_id: { $first: "$sub.plan_id" },
                        country: { $first: "$country" },
                        state: { $first: "$state" },
                        city: { $first: "$city" },
                        street_address: { $first: "$street_address" },
                        pin_code: { $first: "$pin_code" },
                        gst_no: { $first: "$gst_no" }
                    }
                }
            ]);

            // console.log(result);


            const subscriptions = await subscriptionSchema.find({is_active: true});


            // console.log("Company Id in session branch: " + companyId)

            res.render(`${appPath}/company/master-branch.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                subscriptions: subscriptions,
                branch: result,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });
        } catch (error) {
            console.error("Error in /company/manage-branch:", error);
            res.status(500).send("Internal Server Error");
        }
    }, addBranch: async (req, res) => {
        try {
            const existingUserByEmail = await usersSchema.findOne({ email_id: req.body.email_id });
            if (existingUserByEmail) {
                return res.status(200).send({ success: false, msg: 'User with this email already exists' });
            }

            const existingUserByMobile = await usersSchema.findOne({ mobile_no: req.body.mobile_no });
            if (existingUserByMobile) {
                return res.status(200).send({ success: false, msg: 'User with this mobile number already exists' });
            }

            const subscriptions = await subscriptionSchema.findOne({ _id: new mongoose.Types.ObjectId(req.body.subscriptions_id) });
            if (!subscriptions) {
                return res.status(200).send({ success: false, msg: 'Selected subscription plan not found' });
            }

            const amount = subscriptions.price * 100;
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: req.body.email_id
            };

            razorpayInstance.orders.create(options, (err, order) => {
                if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Subscriptions Created',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_ID_KEY,
                    });
                } else {
                    res.status(400).send({ success: false, msg: 'Razorpay order creation failed' });
                }
            });
        } catch (error) {
            console.error("addBranch error: ", error);
            res.status(500).send({ success: false, msg: 'Internal Server Error' });
        }
    },
     insertBranchData: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);

            const newCustomer = new usersSchema({
                name: req.body.name,
                mobile_no: req.body.mobile_no,
                email_id: req.body.email_id,
                password: req.body.password,
                role_name: 'B'
            });

            const savedCustomer = await newCustomer.save();

            const userId = await tokenController.getUserID(req, res);
            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const newBranch = new branchSchema({
                branch_name: req.body.branch_name,
                country: req.body.country_id,
                state: req.body.state_id,
                city: req.body.city_id,
                street_address: req.body.street_address,
                pin_code: req.body.pin_code,
                gst_no: req.body.gst_no,
                company_id: companyId,
                user_id: savedCustomer._id,
            });

            const savedBranch = await newBranch.save();

            const subscription = await subscriptionSchema.findOne({ _id: new mongoose.Types.ObjectId(req.body.subscriptions_id) });

            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + subscription.duration);

            const newPurchaseSubscription = new purchaseSubscriptionSchema({
                plan_id: new mongoose.Types.ObjectId(req.body.subscriptions_id),
                branch_id: new mongoose.Types.ObjectId(savedBranch._id),
                duration: subscription.duration,
                price: subscription.price,
                start_date: startDate,
                end_date: endDate
            });

            await newPurchaseSubscription.save();

            req.session.Success = "Branch added and subscription activated successfully!";
            res.json({ success: true });
        } catch (error) {
            console.error("insertBranchData error: ", error);
            res.status(500).json({ success: false, msg: "Internal Server Error" });
        }
    },
    fetchBranch: async (req, res) => {
        try {
            const branch_id = req.params.id;
            const branch = await branchSchema.findOne({ _id: new mongoose.Types.ObjectId(branch_id) });
            if (!branch) return res.status(404).json({ success: false, msg: "Branch not found" });

            const user = await usersSchema.findOne({ _id: branch.user_id });

            res.json({
                ...branch._doc,
                userName: user ? user.name : "",
                userEmail: user ? user.email_id : "",
                userMobile: user ? user.mobile_no : ""
            });
        } catch (error) {
            console.error("fetchBranch error:", error);
            res.status(500).json({ success: false, msg: "Internal Server Error" });
        }
    },
    updateBranch: async (req, res) => {
        try {
            const { branch_id, branch_name, street_address, city_id, state_id, country_id, pin_code, gst_no, name, mobile_no, email_id, password } = req.body;

            // Update Branch
            await branchSchema.updateOne(
                { _id: new mongoose.Types.ObjectId(branch_id) },
                {
                    $set: {
                        branch_name,
                        street_address,
                        city: city_id,
                        state: state_id,
                        country: country_id,
                        pin_code,
                        gst_no,
                        updated_at: new Date()
                    }
                }
            );

            const branch = await branchSchema.findOne({ _id: new mongoose.Types.ObjectId(branch_id) });

            // Update User
            const userUpdate = {
                name,
                mobile_no,
                email_id,
                updated_at: new Date()
            };

            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                userUpdate.password = await bcrypt.hash(password, salt);
            }

            await usersSchema.updateOne(
                { _id: branch.user_id },
                { $set: userUpdate }
            );

            req.session.Success = "Branch updated successfully!";
            res.json({ success: true });
        } catch (error) {
            console.error("updateBranch error:", error);
            res.status(500).json({ success: false, msg: "Internal Server Error" });
        }
    }
}