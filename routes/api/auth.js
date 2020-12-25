const express= require('express');
const bcrypt=require('bcryptjs');
const router= express.Router();
const jwt=require('jsonwebtoken');
const config=require('config');
const auth=require('../../middleware/auth');
const {check, validationResult}=require('express-validator');
const User=require('../../models/Users');

router.get('/',auth, async (req,res)=>{

    try{

        const user=await User.findById(req.user.id);
        res.json(user);


    }
    catch(err){
       console.error(err.message);
    }
});

router.post('/',[
    
    check('email','please enter valid email').isEmail(),
    check('password','password is required').exists()
],
async(req,res)=>{
    
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {password,email}=req.body;
    try{
        
    let user =await User.findOne({email});

    if(!user){
        return res.status(400).json({errors:[{msg:'Invalid Credntials'}]});
        
    }
    
      const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({errors:[{msg:'Invalid Credntials'}]});
        
    }
    const payload={
        user:{
            id:user.id
        }
    }
    jwt.sign(payload,config.get('jwtSecret'),{expiresIn:36000},(err,token)=>{
             
        if(err){
            throw err;
        }
        res.json({token});

    });

    }
    catch(err){
        console.log(err.message);
    }
});

module.exports=router;