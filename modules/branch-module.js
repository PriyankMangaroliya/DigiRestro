const { default: mongoose } = require("mongoose");

const branchSchema = new mongoose.Schema(
    {
        branch_name:{
            type:String,
            reuquired:true
        },
        country:{
            type:String,
            require:true
        },
        state:{
            type:String,
            required:true
        },
        city:{
            type:String,
            reuqired:true
        },
        street_address:{
            type:String,
            required:true
        },
        pin_code:{
            type:Number,
            reqired:true
        },
        gst_no:{
            type:String,
            required:true
        },
        deleted:{
            type:Boolean
        },
        created_at:{
            type:Date,
            default:new Date()
        },
        updated_at:{
            type:Date,
            default:new Date()   
        },
        deleted_at:{
            type:Date,
            default: null   
        },
        company_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'company',
            required:true
        },
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            reqired:true
        }
    },
    {collection:'branch'}
)

const branch = mongoose.model('branch', branchSchema);
module.exports = branch;