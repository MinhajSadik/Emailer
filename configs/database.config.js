import mongoose from "mongoose";

const DB_URL = `mongodb://127.0.0.1:27017/${process.env.DB_NAME}`;

async function connectDB(){
    try {
        mongoose.connect(DB_URL);
        console.log(`Database Connected Successfully...`);
      } catch (error) {
        console.error(error.message);
      }
}

export default connectDB;