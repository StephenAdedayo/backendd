const express = require('express')

const app = express()

require('dotenv').config()
const PORT = process.env.PORT || 5050

const connectDB = require('./db/db')
connectDB()

const userRoute = require('./routes/userRoutes')

app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use('/api/users', userRoute)





app.get('/api', (req, res) => {
    res.json({message : 'My server'})
})


app.listen(PORT, () => {
    console.log('server started succcessfully');
    
})