const router = require('express').Router()
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoriesController')
const { validObjectId } = require('../middlewares/validObjectId')

const {
  verifyTokenAndAdmin, verifyToken,
} = require('../middlewares/verifyToken')

// /api/categories
router
  .route('/')
  .post(verifyTokenAndAdmin,createCategory )
  .get(getAllCategories)

// api/categories/:id
router
  .route('/:id')
  .delete(validObjectId,verifyTokenAndAdmin,deleteCategory)

module.exports = router
