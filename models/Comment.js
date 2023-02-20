const mongoose = require('mongoose')
const Joi = require('joi')

const { Schema } = mongoose

const commentSchema = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)
// Comment Model
const Comment = mongoose.model('Comment', commentSchema)

// Validate create comment
const validateCreateComment = obj => {
  const schema = Joi.object({
    postId: Joi.string().required().label('Post ID'),
    text: Joi.string().trim().required().label('Text'),
  })
  return schema.validate(obj)
}

// Valiate update comment
const validateUpateComment = obj => {
  const schema = Joi.object({
    text: Joi.string().required(),
  })
  return schema.validate(obj)
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpateComment,
}
