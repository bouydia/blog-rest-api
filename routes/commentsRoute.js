const router = require('express').Router()
const {validObjectId}=require('../middlewares/validObjectId')
const {
  CreateComment,
  deleteComments,
  updateComments,
  getAllComments,
} = require('../controllers/CommentsController')
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middlewares/verifyToken')

// /api/comments
router.route('/').post(verifyToken,CreateComment).get(verifyTokenAndAdmin,getAllComments)

// api/comments/:id
router
  .route('/:id')
  .delete(validObjectId, verifyToken, deleteComments)
  .put(validObjectId, verifyToken, updateComments)


module.exports=router