import { Request, Response } from "express";
import Restraunt from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const createMyRestraunt = async (req: Request, res: Response) => {
  try {
    // Check if user already created a restraunt
    // A User can only have one restraunt
    const existingRestraunt = await Restraunt.findOne({ user: req.userId });

    if (existingRestraunt) {
      //409: Conflict-Dublicates
      return res.status(409).json({ message: "User Restraunt Already Exists" });
    }

    //get image from request
    const image = req.file as Express.Multer.File;
    //convert image to base64 string from buffer
    const base64Image = Buffer.from(image.buffer).toString("base64");
    //create dataURI string with image properties
    //mimetype: image/png, image/jpeg, image/jpg
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    //Upload image to cloudinary and get image URL
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    //Initialize restraunt object with request body
    const restraunt = new Restraunt(req.body);

    //Store restraunt properties to DB
    restraunt.imageUrl = uploadResponse.url;
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

export default { createMyRestraunt, getMyRestraunt };
