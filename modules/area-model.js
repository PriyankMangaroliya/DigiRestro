const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema(
    {
        area_name: {
            type: String,
            required: true,
        },
        branch_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'branch',
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
        updated_at: {
            type: Date,
            default: new Date(),
        },
    },
    {collection: "area"}
);

const area = mongoose.model('area', areaSchema);

module.exports = area;
