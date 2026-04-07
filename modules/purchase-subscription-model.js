const mongoose = require('mongoose');

const purchaseSubscriptionSchema = new mongoose.Schema(
    {
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subscription_plan',
            required: true,
        },
        branch_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'branch',
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        start_date: {
            type: Date,
            default: new Date(),
        },
        end_date: {
            type: Date,
            required: true,
        },
    },
    {collection: "purchase_subscription"}
);

const purchaseSubscription = mongoose.model('purchase_subscription', purchaseSubscriptionSchema);

module.exports = purchaseSubscription;
