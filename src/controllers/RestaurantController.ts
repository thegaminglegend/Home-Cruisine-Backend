import { Request, Response } from "express";

const searchRestaurants = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.error(error);
    //500: Internal server error
    res.status(500).send({ message: "Internal server error" });
  }
};

export default { searchRestaurants };
