import mongoose from "mongoose";
import { MONGODB_URI } from "../constants/env";

export const connectDB = () => {
  try {
    console.log(MONGODB_URI,"db uri exist here !! ");
    
    mongoose.connect(MONGODB_URI,{
      // @ts-ignore
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).then(() => {
      console.log("db is connected !");
    });
  } catch (error) {
    console.log("Failed to connect DB !!");
    process.exit(1);
  }
};
