const express = require('express')
const {
  registerUserCtr,
  loginUserCtr,
} = require('../controllers/authController')
const router = express.Router()

router.post('/register', registerUserCtr)
router.post('/login', loginUserCtr)

module.exports = router