import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config()

const DB_URL = process.env.DB_URL;

async function connectDB(){
    // try {
    //     mongoose.connect(DB_URL, {
    //       useNewUrlParser: true,
    //       useUnifiedTopology: true,
    //     });
    //     console.log(`Database Connected Successfully...`);
    //   } catch (error) {
    //     console.error(error.message);
    //   }
    mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000, // Adjust the timeout as needed
      connectTimeoutMS: 10000 // Adjust the timeout as needed
    }).then(() => {
      console.log(`Database Connected Successfully...`);
    }).catch((error) => {
      console.error('Failed to connect to MongoDB', error);
    });
}



export default connectDB;