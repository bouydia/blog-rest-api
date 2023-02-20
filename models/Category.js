const mongoose = require('mongoose')
const Joi = require('joi')

const { Schema } = mongoose

const categorySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)
// Comment Model
const Category = mongoose.model('Category', categorySchema)

// Validate create comment
const validateCreateCategory = obj => {
  const schema = Joi.object({
    title: Joi.string().trim().required().label('Title'),
  })
  return schema.validate(obj)
}

module.exports = {
  Category,
  validateCreateCategory,
}
