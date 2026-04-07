const mongoose = require('mongoose');

// Define the schema for food_sub_item
const foodSubItemSchema = new mongoose.Schema({
    sub_item_name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    food_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'food_item',
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: new Date(),
    },
    deleted_at: {
        type: Date,
        default: null,
    }
}, {collection: "food_sub_item"});

// Create the model for food_sub_item
const foodSubItem = mongoose.model('food_sub_item', foodSubItemSchema);

module.exports = foodSubItem;
