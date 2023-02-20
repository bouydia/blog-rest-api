const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')
const { hashPassword } = require('../utils/hashPassword')
const { User, validateUpdateUser } = require('../models/User')
const path=require('path')
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require('../utils/cloudinary')
const fs = require('fs')
const {Post}=require('../models/Post')
const {Comment}=require('../models/Comment')

/**-------------------------------
 * @desc get all users
 * @route /api/users/profile
 * @method GET
 * @access private
 *---------------------------------*/
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isAdmin: false }).select('-password')
  res.status(201).json(users)
})

/**-------------------------------
 * @desc get user profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
 *---------------------------------*/
module.exports.getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userProfile = await User.findById(id).select('-password').populate('posts')
  if (!userProfile) {
    res.status(404).json({ message: 'user not found' })
  }
  res.status(200).json({ user: userProfile })
})

/**-------------------------------
 * @desc update user profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
 *---------------------------------*/
module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { error } = validateUpdateUser(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  if (req.body.password) {
    req.body.password = hashPassword(req.body.password)
  }

    const updatedUser = await User.findByIdAndUpdate(id,
        {
            $set:
            {
                username: req.body.username,
                password: req.body.password,
                bio: req.body.bio,
            },
        }, { new: true }).select('-password')
    
    return res.status(200).json(updatedUser)
    
})

/**-------------------------------
 * @desc get users count
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
 *---------------------------------*/
module.exports.getUsersCount = asyncHandler(async (req, res) => {
  const count = await User.count()
  res.status(201).json(count)
})

/**-------------------------------
 * @desc photo upload
 * @route /api/users/profile/photo-profile-upload
 * @method POST
 * @access private (user himself)
 *---------------------------------*/
module.exports.photoProfileUpload = asyncHandler(async (req, res) => {
  // 1.Validation
  if (!req.file) {
    return res.status(400).json({ message: 'no file provided' })
  }
  // 2.Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
  
  // 3.upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath)
  const { public_id, secure_url } = result
  
  // 4.get the user from DB
  const user=await User.findById(req.user.id)
  
  // 5.Delete the old profile photo if exist
  if (user.profilePhoto.publicId != null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId)
  }
  
  // 6.change the profile field in the DB
  user.profilePhoto = {
    url: secure_url,
    publicId:public_id
  }
  await user.save()
  
  // 7.send response to the client
  res.status(201).json({
    message: 'photo profile added successfully ',
    profilePhoto: {
      url: secure_url,
      publicId: public_id,
    },
  })
  
  // 8.remove image from the server
  fs.unlinkSync(imagePath)
  
})

/**-------------------------------
 * @desc   delete user profile(account)
 * @route  /api/users/profile/:id
 * @method DELETE
 * @access private (admin or user himself)
 *---------------------------------*/
module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params
  // 1.get user from db
  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({message:'user not found'})
  }
  // 2.get all post from db
  const userPosts=await Post.find({user:user._id})
  
  // 3.get the public id from the posts
  const publicIds=userPosts?.map((post)=>post.image.publicId)
  
  // 4.delete all posts image from cloudinary that belong to this user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds)
  }
  // 5.delete the profile picture from clouinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId)
  
  // 6.delete user posts an comments
  await Post.deleteMany({ user: user._id })
  await Comment.deleteMany({ user: user._id })
  
  // 7.delete user himself
  await User.findByIdAndDelete(id)
  
  // 8.send a response to the client
  return res.status(200).json({ message: 'your profile has been deleted' })

})

