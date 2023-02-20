const cloudinary = require('cloudinary').v2

CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
API_KEY = process.env.CLOUDINARY_API_KEY
API_SECRET = process.env.CLOUDINARY_SECRET_KEY
CLOUDINARY_URL = `cloudinary://${API_KEY}:${API_SECRET}@${CLOUD_NAME}`

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
})

//cloudinary upload image
const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, { resource_type: 'auto' })
        return data
    } catch (error) {
        return error
    }
}

//cloudinary remove image
const cloudinaryRemoveImage = async ImagePublicId => {
  try {
    const result = await cloudinary.uploader.destroy(ImagePublicId)
    return result
  } catch (error) {
    return error
  }
}

const cloudinaryRemoveMultipleImage = async publicIds => {
  try {
    const result = await cloudinary.v2.api.delete_resources(publicIds)
    return result
  } catch (error) {
    return error
  }
}



module.exports = {
    cloudinaryRemoveImage,
  cloudinaryUploadImage,
    cloudinaryRemoveMultipleImage
}