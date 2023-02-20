const asyncHandler = require('express-async-handler')
const { Category, validateCreateCategory } = require('../models/Category')

/**-------------------------------
 * @desc   Create category
 * @route  /api/categories/
 * @method POST
 * @access private (only admin )
 *---------------------------------*/
module.exports.createCategory = asyncHandler(async (req, res) => { 
    const { error } = validateCreateCategory(req.body)
    if (error) {
        return res.status(400).json({message:error.details[0].message})
    }
    const category = await Category.create({
        user: req.user.id,
        title:req.body.title
    })
    res.status(201).json(category)
})
/**-------------------------------
 * @desc   get All categories
 * @route  /api/categories/
 * @method GET
 * @access public
 *---------------------------------*/
module.exports.getAllCategories = asyncHandler(async (req, res) => { 
    const categories = await Category.find()
    res.status(201).json(categories)
})

/**-------------------------------
 * @desc   delete category
 * @route  /api/categories/:id
 * @method DELETE
 * @access private (admin)
 *---------------------------------*/
module.exports.deleteCategory = asyncHandler(async (req, res) => { 
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'category not found'})
    }
    await Category.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'category has been deleted successfully' ,categoryId:req.params.id})
})