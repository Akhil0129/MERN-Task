const express= require('express');
const router= express.Router();
const {check, validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const User=require('../../models/Users');
const jwt=require('jsonwebtoken');
const config=require('config');
const mailgun = require("mailgun-js");
const DOMAIN = '';
const mg = mailgun({apiKey: '', domain: DOMAIN});
const _ =require('lodash');

router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','please enter valid email').isEmail(),
    check('password','please enter 6 or more characters').isLength({min:6})
],
async(req,res)=>{
    
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {name,password,email}=req.body;
    try{
        
    let user =await User.findOne({email});

    if(user){
        return res.status(400).json({errors:[{msg:'user already exists'}]});
        
    }
    user=new User({
        name,
        email,
        password
    });

    const salt=await bcrypt.genSalt(10);

    user.password=await bcrypt.hash(password,salt);

    await user.save();

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


router.put('/forget-password',(req,res)=>{
  const {email}=req.body;

   User.findOne({email},(err,user)=>{
         
    if(err || !user){
        return res.status(400).json({error:"user with this email doesn't exist"});
    }
    const token=jwt.sign({_id:user._id},config.get('jwtSecret'),{expiresIn:'20m'});
    const data={
        from:'noreply@hello.com',
        to:email,
        subject:'Account Activation link',
        html:`<h2>Please click given link to reset password</h2>
                  <p>http://localhost:3000/resetpassword/${token}</p>
                  `
    };
    return user.updateOne({resetLink:token},function(err,success){
        if(err || !user){
            return res.status(400).json({error:"reset password link error"});
        }
        else{
            mg.messages().send(data,function(error,body){
                if(error){
                    return res.json({
                        error:error.message
                    })
                }
                return res.json({message:'Email has been sent,kindly follow the instructions'});
            });

        }

    })

   });

});


router.put('/reset-password',(req,res)=>{

    const {resetLink,newPass}=req.body;
    if(resetLink){
        
           
            User.findOne({resetLink},(err,user)=>{
                if(err || !user){
                    return res.status(400).json({error:"user with this token doesn't exist"});
                }
                const obj={
                    password:newPass,
                    resetLink:''
                }
                user=_.extend(user,obj);
                user.save((err,result)=>{
                    if(err ){
                        return res.status(400).json({error:"reset password  error"});
                    }
                    else{
                       
                        return res.json({message:'password changed successfull'});
                    }

                });

            });

       
    }
    else{
        return res.status(400).json({error:"Authentication error"});
    }

});

module.exports=router;