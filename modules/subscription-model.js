const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    plan_name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
}, { collection: "subscription_plan" });

const Subscription = mongoose.model('subscription_plan', subscriptionSchema);

module.exports = Subscription;
