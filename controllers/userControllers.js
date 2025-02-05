const User = require('../models/userModel')
const generateToken = require('../utils/generateToken')
const crypto = require('crypto')
const sendMail = require('../utils/email')

const registerUser = async (req, res) => {

   try { 
    const {firstName, lastName, email, phone, password} = req.body

    const userExists = await User.findOne({email})

    if(userExists){
        return res.status(400).json({message:'user already exists'})
    }

    const user = await User.create({firstName, lastName, email, phone, password})
       
    if(user){
       
        const token = generateToken(user._id)
        res.cookie('jwt', token, {
            
            httpOnly : true,
            sameSite : 'strict',
            maxAge : 30 * 24 * 60 * 60 * 1000
        
        })
        res.status(201).json(
            
            {message: 'user registered succesfully',
             user,
             token   

            })
    }
   } 
   
   catch (error) {
    res.status(400).json({message: 'invalid user data'})
   }
}


const loginUser = async (req, res) => {
  

    const {email, password} = req.body
    
    const userExists = await User.findOne({email})

    if(userExists && (await userExists.matchPassword(password))){
         const token = generateToken(userExists._id)
         res.cookie('jwt', token, {
          
            httpOnly : true,
            sameSite : 'strict',
            maxAge : 30 * 24 * 60 * 60 * 1000

         })

         res.status(200).json({message: 'user logged in successfully', 
          userExists,
          token

         })
    }  else{
        res.status(401).json({message: 'invalid email or password'})
    }

    

  
}


const logoutUser = async (req, res) => {

try {

    res.cookie('jwt', '', {
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(0) // Set cookie expiration to 0 to immediately invalidate it
      });
  
      // Send a response confirming logout
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Logout failed', error: error.message });
    }
    


}



const forgotPassword = async (req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        res.status(401)
        throw new Error('user not found')
    }

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = Date.now() + 10 * 160 * 1000 // 10 days

    await user.save()

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`

    const message = `You are receiving this email because you or someone else have requested the reset of a password. Please click the following link to reset your password: \n\n ${resetUrl}`

    await sendMail({
       email : user.email,
       subject : 'PASSWORD RESET TOKEN',
       message 
    })

    res.status(200).json({success: true, data:'Reset link sent to email'})
}


const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    })

    if(!user){
        res.status(401)
        throw new Error("Invalid token")
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
      
    res.status(200).json({ success: true, data: "Password updated successfully"})
}



module.exports = {registerUser, loginUser, logoutUser, forgotPassword, resetPassword}