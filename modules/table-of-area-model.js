const mongoose = require('mongoose');

const tableOfAreaSchema = new mongoose.Schema(
    {
        table_name: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
        },
        area_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'area',
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
            required: true,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        created_at: {
            type: Date,
            required: true,
            default: new Date(),
        },
        updated_at: {
            type: Date,
            default: new Date(),
        },
    },
    {collection: "table_of_area"}
);

const tableOfArea = mongoose.model('table_of_area', tableOfAreaSchema);

module.exports = tableOfArea;
