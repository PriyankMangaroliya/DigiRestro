const tokenController = require("../token-controller");
const {setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY
});

module.exports = {
    renewSubscription: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);

            await setDefaultCompany(userId, req);

            const branch_id = req.query.branch_id;
            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const subscriptions = await subscriptionSchema.find({is_active: true});

            // console.log(branch_id)
            res.render(`${appPath}/company/renew-subscription.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                subscriptions: subscriptions,
                branch_id: branch_id,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });
        } catch (error) {
            console.error("Error managing renew Subscription:", error);
            res.status(500).json({message: 'Internal server error'});
        }
    }, renewBranch: async (req, res) => {
        try {
            const subscriptions_id = req.query.subscriptionId;

            const subscriptions = await subscriptionSchema.find({_id: new mongoose.Types.ObjectId(subscriptions_id)});

            const amount = subscriptions[0].price * 100
            const options = {
                amount: amount, currency: 'INR', receipt: req.body.email_id
            }

            razorpayInstance.orders.create(options, async (err, order) => {
                if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Subscriptions Updated',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_ID_KEY,
                    });
                    // }
                } else {
                    res.status(400).send({success: false, msg: 'Something went wrong!'});
                }
            });

        } catch (error) {
            console.error("Error renew scription:", error);
            res.status(500).json({message: 'Internal server error'});
        }
    },
    handlePaymentSuccess: async (req, res) => {
        try {
            const subscriptions_id = req.body.subscriptionId;
            const subscriptions = await subscriptionSchema.find({ _id: new mongoose.Types.ObjectId(subscriptions_id) });
            const branch_id = req.body.branch_id;

            const purchase_subscription = await purchaseSubscriptionSchema.find({ branch_id: new mongoose.Types.ObjectId(branch_id) }).sort({ _id: -1 });

            if (purchase_subscription && purchase_subscription.length > 0) {
                await purchaseSubscriptionSchema.updateOne({ _id: purchase_subscription[0]._id }, { $set: { is_active: false } });
            }

            if (!subscriptions || subscriptions.length === 0) {
                return res.status(400).send({ success: false, msg: 'Subscription plan not found' });
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + subscriptions[0].duration);

            const newPurchaseSubscription = new purchaseSubscriptionSchema({
                plan_id: new mongoose.Types.ObjectId(subscriptions[0]._id),
                branch_id: new mongoose.Types.ObjectId(branch_id),
                duration: subscriptions[0].duration,
                price: subscriptions[0].price,
                start_date: startDate,
                end_date: endDate
            });

            const savePurchaseSubscription = await newPurchaseSubscription.save();

            if (savePurchaseSubscription) {
                req.session.Success = "Subscription renewed successfully!";
                res.status(200).send({
                    success: true, msg: 'Subscription added successfully',
                });
            } else {
                res.status(400).send({ success: false, msg: 'Failed to add subscription' });
            }
        } catch (error) {
            console.error("Error renew subscription:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}