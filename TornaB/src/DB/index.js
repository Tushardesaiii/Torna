
import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const connectDB = async () => {

    try { 
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected successfully on  DB: ${connectionInstance.connection.name} at Host: ${connectionInstance.connection.host} on Port: ${connectionInstance.connection.port}`);
    
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1)
        
    }


}

export default connectDB;