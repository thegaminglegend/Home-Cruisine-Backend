import { Request, Response } from "express";
import Restraunt from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

//Function to create restraunt of logged in user
const createMyRestraunt = async (req: Request, res: Response) => {
  try {
    // Check if user already created a restraunt
    // A User can only have one restraunt
    const existingRestraunt = await Restraunt.findOne({ user: req.userId });

    if (existingRestraunt) {
      //409: Conflict-Dublicates
      return res.status(409).json({ message: "User Restraunt Already Exists" });
    }

    //Upload image to cloudinary and get image URL
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    //Initialize restraunt object with request body
    const restraunt = new Restraunt(req.body);

    //Store restraunt properties to DB
    restraunt.imageUrl = imageUrl;
    restraunt.user = new mongoose.Types.ObjectId(req.userId);
    restraunt.lastUpdate = new Date();
    await restraunt.save();

    //201: Created
    //Send restraunt object as response
    res.status(201).send(restraunt);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

//Function to get restraunt of logged in user
const getMyRestraunt = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restraunt.findOne({ user: req.userId });

    if (!restaurant) {
      //404: Not Found
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

//Function to update restraunt of logged in user
const updateMyRestraunt = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restraunt.findOne({ user: req.userId });

    if (!restaurant) {
      //404: Not Found
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //Update all the fields of the restraunt object with request body
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdate = new Date();

    //If image is uploaded set imageUrl
    if (req.file) {
      //Upload image to cloudinary and get image URL
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    //Save to DB
    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  //get image from request
  const image = file;

  //convert image to base64 string from buffer
  const base64Image = Buffer.from(image.buffer).toString("base64");
  //create dataURI string with image properties
  //mimetype: image/png, image/jpeg, image/jpg
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  //Upload image to cloudinary and get image URL
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

  return uploadResponse.url;
};

export default { createMyRestraunt, getMyRestraunt, updateMyRestraunt };
