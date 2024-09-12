const User = require('../models/userModel')
const generateToken = require('../utils/generateToken')

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
  try {

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

    

  } catch (error) {
    console.log(error.message);
    
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



module.exports = {registerUser, loginUser, logoutUser}