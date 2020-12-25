const mongoose= require('mongoose');

const ProfileSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    contact:{
        type:String,
        required:true,
    },
    salary:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true
    }
})
module.exports=profile=mongoose.model('profile',ProfileSchema);