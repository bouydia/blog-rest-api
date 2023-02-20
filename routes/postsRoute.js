const router = require('express').Router()
const { verifyToken } = require('../middlewares/verifyToken')
const uploadPhoto = require('../middlewares/photoUpload')
const { createPostCtrl, getAllPostsCtrl, getSinglePost, getPostsCount, deletePost, updatePost, updatePostImage, toggleLike } = require('../controllers/postController')
const { validObjectId } = require('../middlewares/validObjectId')

router.route('/')
    .post(verifyToken, uploadPhoto.single('image'), createPostCtrl)
    .get(getAllPostsCtrl )

router.route('/count').get(getPostsCount)
router.route('/upload-image/:id').put(validObjectId,verifyToken,uploadPhoto.single('image'), updatePostImage)
router
  .route('/like/:id')
  .put(validObjectId, verifyToken, toggleLike)

router.route('/:id').
    get(validObjectId, getSinglePost)
    .delete(validObjectId, verifyToken, deletePost)
    .put(validObjectId,verifyToken,updatePost)
    
    
module.exports = router
