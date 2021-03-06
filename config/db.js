const mongoose=require('mongoose')
const config=require('config')
const db=config.get('mongoURI')

const connectDB=async()=>{
    try {
        await mongoose.connect(db,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex:true,
            useFindAndModify:false
        })
        console.log('MongoDB Connectd....')
    } catch (error) {
        console.error(error.message)
        // Exit Process when mongo not connectd 
        process.exit(1)
    }
}

module.exports=connectDB