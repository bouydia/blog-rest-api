const bycrypt = require('bcryptjs')
const mongoose = require('mongoose')
const asyncHandler=require('express-async-handler')
const {User,validateRegisterUser, validateLoginUser}=require('../models/User')
const { generateToken } = require('../utils/generateToken')

/**-------------------------------
 * @desc Register New User
 * @route /api/auth/register
 * @method POST
 * @access public
 *---------------------------------*/
module.exports.registerUserCtr = asyncHandler(async (req,res) => {
    // validation
    const {error}=validateRegisterUser(req.body)
    if(error) return res.status(400).json({message:error.details[0].message})
    // user exist ??
    let user = await User.findOne({ email: req.body.email })
    if(user)return res.status(400).json({ message: 'user already exist ' })
    //hash the password
    const salt =await bycrypt.genSalt(10)
    const hashPassword=await bycrypt.hash(req.body.password,salt)
    //new user user and save to db
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
    })
    await newUser.save()
    
    //send a response to client
    res.status(201).json({ message: 'your registered successfylly please login'})
})


/**-------------------------------
 * @desc login user
 * @route /api/auth/login
 * @method POST
 * @access public
 *---------------------------------*/
module.exports.loginUserCtr = asyncHandler(async (req,res) => {
    // validation
    const { error } = validateLoginUser(req.body)
    if (error) {
        return res.status(400).json({message:error.details[0].message})
    }
    // is user exist
    const user=await User.findOne({email:req.body.email})
    if (!user) {
      return res
        .status(400)
        .json({ message: "this email dosen't exist ,try to register" })
    }
    const isPasswordMatch = await bycrypt.compare(req.body.password, user.password)
    if (!isPasswordMatch) {
         return res
           .status(400)
           .json({ message: "incorrect password" })
    }
    
    // generate token
    const token =await generateToken(user.id,user.isAdmin)
    
    // send response to client
    return res.status(201).json({
        _id:user._id,
        isAdmin: user.isAdmin,
        profilePhoto:user.profilePhoto,
        token
    })
})