const express = require('express')
const {
  getAllUsers, getUserProfile, updateUserProfile, getUsersCount, photoProfileUpload, deleteUserProfile,
} = require('../controllers/usersController')
const { validObjectId } = require('../middlewares/validObjectId')
const {verifyTokenAndAdmin, verifyTokenAndUser, verifyToken, verifyTokenAndAuthorization} = require('../middlewares/verifyToken')
const uploadPhoto = require('../middlewares/photoUpload')

const router = express.Router()

// /users/profile
router.route('/profile').get(verifyTokenAndAdmin,getAllUsers)

// /users/profile/:id
router
.route('/profile/:id')
  .get(validObjectId, getUserProfile)
  .put(validObjectId, verifyTokenAndUser, updateUserProfile)
  .delete(validObjectId, verifyTokenAndAuthorization, deleteUserProfile)
  
router.route('/profile/count').get(verifyTokenAndAdmin, getUsersCount)

router.route('/profile/profile-photo-upload').post(verifyToken,uploadPhoto.single('image'),photoProfileUpload)



module.exports=router