import { Request, Response } from "express";
import User from "../models/user";

//Function to get current user info from DB
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    //get current user from DB with mongoose id
    const currentUser = await User.findById({ _id: req.userId });

    //check if user exists
    if (!currentUser) {
      //404: Not Found
      return res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Something went wrong" });
  }
};

//Function to create user in DB
const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    //Check if user exists
    const existingUser = await User.findOne({ auth0Id: auth0Id });

    //If user exists dont do anything
    if (existingUser) {
      //200: OK
      return res.status(200).send();
    }

    //create user if not exist
    const newUser = new User(req.body);
    await newUser.save();

    //return user object to client
    //201: Created
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Error creating user" });
  }
};

//Function to update user info in DB
const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, country, city } = req.body;
    const user = await User.findById(req.userId);

    //Check if user exists
    if (!user) {
      //404: Not Found
      return res.status(404).json({ message: "User not found" });
    }

    //If user exists Update user information
    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;

    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    //500: Internal Server Error
    res.status(500).json({ message: "Error updating user" });
  }
};

export default {
  createCurrentUser,
  updateCurrentUser,
  getCurrentUser,
};
