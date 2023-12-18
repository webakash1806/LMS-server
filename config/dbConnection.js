import mongoose from "mongoose";

mongoose.set('strictQuery', false)

const connectionToDB = async () => {
    try {
        const { connection } = await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms'
        )
        if (connection) {
            console.log(`connected too MONGODB${connection.host}`)
        }
    }

    catch (err) {
        console.log(err)
        process.exit(1)
    }
}

export default connectionToDB