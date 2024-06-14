import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config()

const DB_URL = `mongodb://127.0.0.1:27017/${process.env.DB_NAME}`;

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
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      console.log('Connected to MongoDB');
    }).catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
}



export default connectDB;