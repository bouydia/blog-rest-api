const mongoose = require('mongoose')

module.exports = async () => {
    try {
        mongoose.set('strictQuery', false)
        const connectToDb = await mongoose.connect(process.env.MONGODB_URI)
        if (connectToDb) {
          console.log('Database Connected Successfully')
        }
    } catch (error) {
        console.log('Faild Connection !!!');
    }
}
