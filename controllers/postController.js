const fs = require('fs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require('../models/Post')
const {Comment} =require('../models/Comment')
const {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
} = require('../utils/cloudinary')

// create getOne getAll update delete

/**-------------------------------
 * @desc   Create New Post
 * @route  /api/posts/
 * @method POST
 * @access private (only login user)
 *---------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1.validation for image
  if (!req.file) {
    return res.status(400).json({ message: 'no image provided' })
  }
  // 2.validation for data
  const { error } = validateCreatePost(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  // 3.upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
  const result = await cloudinaryUploadImage(imagePath)
  // 4.create new post and save it
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  })
  // 5.remove image from the server
  fs.unlinkSync(imagePath)

  // 6.send messgae to the client
  return res.status(201).json({ post })
})

/**-------------------------------
 * @desc   Get all Post
 * @route  /api/posts/
 * @method GET
 * @access public
 *---------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3
  const { pageNumber, category } = req.query
  let posts
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate('user', ['-password'])
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate('user', ['-password'])
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', ['-password'])
  }

  res.status(200).json(posts)
})

/**-------------------------------
 * @desc   Get Single Post
 * @route  /api/posts/:id
 * @method GET
 * @access public
 *---------------------------------*/
module.exports.getSinglePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', [
    '-password',
  ]).populate('comments')
  if (!post) {
    res.status(404).json({ message: 'post not found' })
  }
  res.status(200).json(post)
})

/**-------------------------------
 * @desc   Get Post Count
 * @route  /api/posts/count
 * @method GET
 * @access public
 *---------------------------------*/
module.exports.getPostsCount = asyncHandler(async (req, res) => {
  const count = await Post.count()
  res.status(200).json(count)
})

/**-------------------------------
 * @desc   Delete Post
 * @route  /api/posts/:id
 * @method delete
 * @access private (only login user or admin)
 *---------------------------------*/
module.exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) {
    res.status(404).json({ message: 'post not found' })
  }
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id)
    await cloudinaryRemoveImage(post.image.publicId)

    // TODO remove comment belong this post
    await Comment.deleteMany({ postId: post._id })
    res.status(200).json({
      message: 'post has been deleted successfully',
      postId: req.params.id,
    })
  } else {
    res.status(403).json({ message: 'access denied , forbidden' })
  }
})

/**-------------------------------
 * @desc   update Post
 * @route  /api/posts/:id
 * @method PUT
 * @access private(only owner)
 *---------------------------------*/
module.exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params.id
  // 1.validate
  const { error } = validateUpdatePost(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  // 2.get the post from db and check if exist
  const post = await Post.findById(req.params.id)
  if (!post) {
    return res.status(404).json({ message: 'post not found' })
  }

  // 3.check if post belong to logged in user
  if (req.user.id != post.user.toString()) {
    return res
      .status(403)
      .json({ message: 'access denied you are not allowed' })
  }

  // 4.update post
  const updatedPost = await Post.findOneAndUpdate(
    id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate('user', ['-password'])

  // 5.send response to the client
  res
    .status(200)
    .json({ message: 'post has been updated successfully', updatedPost })
})

/**-------------------------------
 * @desc   update Post image
 * @route  /api/posts/upload-image/:id
 * @method PUT
 * @access private (only owner)
 *---------------------------------*/
module.exports.updatePostImage = asyncHandler(async (req, res) => {
  const { id } = req.params.id
  // 1.validate
  if (!req.file) {
    return res.status(400).json({ message: 'no image provided' })
  }
  // 2.get the post from db and check if exist
  const post = await Post.findById(req.params.id)
  if (!post) {
    return res.status(404).json({ message: 'post not found' })
  }

  // 3.check if post belong to logged in user
  if (req.user.id != post.user.toString()) {
    return res
      .status(403)
      .json({ message: 'access denied you are not allowed' })
  }

  // 4.delete the old post image
  await cloudinaryRemoveImage(post.image.publicId)
  // 5.upload the new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
  const result = await cloudinaryUploadImage(imagePath)
  // 6.update image field in the db
  const updatedPost = await Post.findOneAndUpdate(
    id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  )
  // 7.send response to the client
  res.status(200).json(updatedPost)
  // 8.remove image from images forlder
  fs.unlinkSync(imagePath)
})

/**-------------------------------
 * @desc   toggle like
 * @route  /api/posts/like/:id
 * @method PUT
 * @access private (only logged user)
 *---------------------------------*/
module.exports.toggleLike = asyncHandler(async (req, res) => {
  const loggedUser = req.user.id
  const { id: postId } = req.params
  let post = await Post.findById(postId)
  if (!post) {
    return res.status(404).json({ message: 'post not found' })
  }
  
  const isPostAlreadyLike = post.likes.find((user) => user.toString() === loggedUser)
  
  console.log('-----------'+isPostAlreadyLike)
  if (isPostAlreadyLike) {
    post = await Post.findByIdAndUpdate(postId, {
      $pull: { likes: loggedUser},
    },{new:true})
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: loggedUser,
        },
      },
      { new: true }
    )
  }
  res.status(200).json(post)
})
