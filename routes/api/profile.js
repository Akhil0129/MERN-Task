const express= require('express');
const router= express.Router();
const {check, validationResult}=require('express-validator');
const Profile=require('../../models/Profile');
const User=require('../../models/Users');
const auth=require('../../middleware/auth');
router.get('/',auth,async(req,res)=>{

    try{
        const profiles=await Profile.find({user:req.user.id});
        res.json(profiles);
    }
    catch(err){
        res.status(500).send('server error');
    }

});
router.post(
    '/',
    [
        auth,
        [
    check('contact','contact is required').not().isEmpty(),
    check('salary','please enter salary'),
    check('role','please enter role')
]
],
async(req,res)=>{
    
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
  
    const {salary,role,contact}=req.body;
    try{
   const  newProfile=new Profile({
        contact,
        salary,
        role,
        user:req.user.id
    });


    const profile=await newProfile.save();
    res.json(profile);
}
catch(err){
    console.log(err.message);
}
});

module.exports=router;