const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const Joi = require('joi')
const { Schema } = mongoose

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png',
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamp: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// get the posts belong this user
UserSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'user',
  localField: '_id',
})

//method (generate auth token)
/* UserSchema.methods.generateAuthToken = async function () {
  const token =  jwt.sign(
    {
      id: this.password,
      isAdmin: this.isAdmin,
    },
    process.env.SECRET
    )
  return token
} */
const User = mongoose.model('User', UserSchema)

//Validate Register User
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(30).required(),
    email: Joi.string().min(5).max(100).required().email(),
    password: Joi.string().min(8).required(),
  })

  return schema.validate(obj)
}

//Validate Login User
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(100).required().email(),
    password: Joi.string().min(8).required(),
  })

  return schema.validate(obj)
}

//Validate Update User
function validateUpdateUser(obj) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(100).email(),
    password: Joi.string().min(8),
    bio: Joi.string().min(20).max(100),
  })

  return schema.validate(obj)
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
}
