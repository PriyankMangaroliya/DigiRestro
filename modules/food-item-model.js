const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
    {
        item_name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        food_sub_category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'food_sub_category',
            required: true,
        },
        food_type: {
            type: Number,
            // enum: [1, 2, 3], 1 -vag ,2 egg  3-non vag
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        created_at: {
            type: Date,
            default: new Date(),
        },
        deleted_at: {
            type: Date,
            default: null,
        },
        updated_at: {
            type: Date,
            default: new Date(),
        },
    },
    {collection: "food_item"}
);

const foodItem = mongoose.model('food_item', foodItemSchema);

module.exports = foodItem;
