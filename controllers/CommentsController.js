const asyncHandler = require('express-async-handler')
const {User}=require('../models/User')
const {
  Comment,
  validateCreateComment,
  validateUpateComment,
} = require('../models/Comment')

/**-------------------------------
 * @desc   Create New Comment
 * @route  /api/comments/
 * @method POST
 * @access private (only logged in user)
 *---------------------------------*/
module.exports.CreateComment = asyncHandler(async(req, res) => {
    const { error } = validateCreateComment(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user=await User.findById(req.user.id)
    const comment = await Comment.create({
        postId:  req.body.postId,
        user: req.user.id,
        text: req.body.text,
        username:user.username
    })
    // create == 201 | get ==200
    res.status(201).json(comment)
})

/**-------------------------------
 * @desc   Get All Comment
 * @route  /api/comments/
 * @method GET
 * @access private (only admin)
 *---------------------------------*/
module.exports.getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate('user')
 
  res.status(200).json(comments)
})

/**-------------------------------
 * @desc   Delete Comments
 * @route  /api/comments/:id
 * @method DELETE
 * @access private (only admin or the owner of the post)
 *---------------------------------*/
module.exports.deleteComments = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
        return res.status(404).json({ message: 'comment not found' })
    }  
    if (req.user.id == comment.user.toString() || req.user.isAdmin) {
        await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'deleted successfuly' })
    } else {
        res.status(403).json({ message: 'access denied,not allowed' })
    }
})


/**-------------------------------
 * @desc   Update Comments
 * @route  /api/comments/:id
 * @method PUT
 * @access private (only admin or the owner of the post)
 *---------------------------------*/
module.exports.updateComments = asyncHandler(async (req, res) => {
    const { error } = validateUpateComment(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
        return res.status(404).json({ message: 'comment not found' })
    }  
    
    if (req.user.id !== comment.user.toString()) {
        res.status(403).json({ message: 'access denied,only user himself can edit his comment' })
    }
    const updatedComment=await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {text:req.body.text},
      },
      { new: true }
    )
    res.status(200).json(updatedComment)
})