const express = require('express')
require('dotenv').config()
const connectDB=require('./config/connectDB')
const { errorHandler, notFound } = require('./middlewares/error')
// Init the app
const app = express()

// Connection to DB
connectDB()

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/authRoute'))
app.use('/api/users', require('./routes/usersRoute'))
app.use('/api/posts', require('./routes/postsRoute'))
app.use('/api/comments', require('./routes/commentsRoute'))
app.use('/api/categories', require('./routes/categoriesRoute'))

// Error Handler Middleware
app.use(notFound)
app.use(errorHandler)

// Running the server
const port = process.env.PORT || 4001
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port} ^_^`)
})

