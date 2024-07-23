import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

//Function to create restraunt of logged in user
const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    // Check if user already created a restraunt
    // A User can only have one restraunt
    const existingRestraunt = await Restaurant.findOne({ user: req.userId });

    if (existingRestraunt) {
      //409: Conflict-Dublicates
      return res.status(409).json({ message: "User Restraunt Already Exists" });
    }

    //Upload image to cloudinary and get image URL
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    //Initialize restraunt object with request body
    const restraunt = new Restaurant(req.body);

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
const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

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
const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

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

//Function to upload image to cloudinary
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

//Function to get all orders of the restaurant
const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    //get the restraunt of the logged in user
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      //404: Not Found
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //get all the orders of the restraunt and the linked restaurant and user
    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

//Function to update order status
const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      //404: Not Found
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    //check if the restaurant of the order belongs to the logged in user
    if (restaurant?.user?._id.toString() !== req.userId) {
      //401: Unauthorized
      return res.status(401).send({ message: "Unauthorized" });
    }

    order.status = status;
    await order.save();

    res.status(200).send(order);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Unable to update order status" });
  }
};

export default {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getMyRestaurantOrders,
  updateOrderStatus,
};
