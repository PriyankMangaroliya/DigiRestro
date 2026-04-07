const mongoose = require('mongoose');

const foodCategorySchema = new mongoose.Schema(
    {
        category_name: {
            type: String,
            required: true,
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
        is_active: {
            type: Boolean,
                default: true,
        },
        deleted: {
            type: Boolean,
            default: false,
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
    }, {collection: "food_category"}
);

const foodCategory = mongoose.model('food_category', foodCategorySchema);

module.exports = foodCategory;
