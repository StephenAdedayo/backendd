const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
       try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB is connected successfully on: ${connect.connection.host}`);
       } catch (error) {
        console.log(`${error.message}`);
        
       }
    
}

module.exports = connectDB