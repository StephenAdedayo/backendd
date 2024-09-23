const express = require('express')

const {registerUser, loginUser, logoutUser, forgotPassword, resetPassword} = require('../controllers/userControllers')

const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/forgot-password', forgotPassword)
router.put("/reset-password/:resetToken", resetPassword)



module.exports = router