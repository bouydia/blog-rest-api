const jwt = require('jsonwebtoken')

function verifyToken(req,res,next) {
    const authToken= req.headers.authorization
    if (authToken) {
        const token = authToken.split(' ')[1]
        try {
            const decodedPayload = jwt.verify(token, process.env.SECRET)
            req.user = decodedPayload
            next()
        } catch (error) {
            return res.status(401).json ({message: 'invalide token,access denied'})
        }
    } else {
        // 401 Unautorize
        return res.status(401).json({  message: 'no token provided,access denied'})
    }
}

function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        const { isAdmin } = req.user
        if (!isAdmin) {
          // 403 forbidden
          return res.status(403).json({ message: 'not allowed,only admin' })
        }
        next()
    })

}
function verifyTokenAndUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id==req.params.id) {
        next()
    } else {
      // 403 forbidden
      return res.status(403).json({ message: 'not allowed,only user himself' })
    }
   
  })
}

function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next()
    } else {
      // 403 forbidden
      return res.status(403).json({ message: 'not allowed,only user himself' })
    }
   
  })
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUser,
  verifyTokenAndAuthorization,
}