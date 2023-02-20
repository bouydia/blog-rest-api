const jwt=require('jsonwebtoken')

module.exports.generateToken = async (id,isAdmin) => {
    const token = jwt.sign(
        {
            id,
            isAdmin
        },
        process.env.SECRET
    )
    return token
}
