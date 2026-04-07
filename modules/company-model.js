const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        company_logo: {
            type: String
        },
        company_name: {
            type: String,
            required: true,
        },
        legal_name: {
            type: String,
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
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
        deleted_at: {
            type: Date,
            default: null,
        },
    },
    {collection: "company"}
);

const company = mongoose.model('company', companySchema);

module.exports = company;
