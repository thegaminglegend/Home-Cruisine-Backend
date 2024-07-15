import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import { v2 as cloudinary } from "cloudinary";

//Connect to MongoDB
mongoose
  .connect(process.env.MOGODB_CONNECTION_STRING as string)
  .then(() => console.log("DB Connected"));

//Connect to Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Create express server
const app = express();
//Middleware convert request body to json
app.use(express.json());
//Middleware for CORS
app.use(cors());

//Health check Endpoint
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

//Routes
//my: convention in REST indicates to the BACKEND to do something to the current user
app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
//Public route
app.use("/api/restaurant", restaurantRoute);

//Start server on port 7000
app.listen(7000, () => {
  console.log("Server is running on port 7000");
});
