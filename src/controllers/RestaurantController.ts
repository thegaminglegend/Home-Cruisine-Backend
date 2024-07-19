import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

//Function to get a restaurant by its id
const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;
    //find the restaurant by its id
    const restaurant = await Restaurant.findById(restaurantId);

    //404: Not found
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//Function to list all the restaurants in a city and apply any filters
const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    //get the query parameters from frontend
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    //query: almost the only time to not use a type
    let query: any = {};

    //regular expression: case insensitive
    query["city"] = new RegExp(city, "i");

    //search the restaurant documents finding the match with the query
    const cityCheck = await Restaurant.countDocuments(query);

    if (cityCheck === 0) {
      console.log("City not found");
      //404: Not found
      //return a default object
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedCuisines) {
      //get all the selected cuisines
      const cuisinesArray = selectedCuisines
        .split(",") //gives an array
        .map((cuisine) => new RegExp(cuisine, "i"));
      //$all:MongoDB query operator: matches arrays that contain all elements specified in the query
      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      //Search for restaurant name if exists if not search for a document that contains one of the cuisines
      //$or: MongoDB query operator: performs a logical OR operation
      query["$or"] = [
        { restaurantName: searchRegex },
        //$in: MongoDB query operator: selects the documents where the value of a
        //field equals any value in the specified array
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize; //for pagination

    //find all the restaurants that match the query
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 }) //sort in ascending order with a dynamic sortOption, why [] is needed
      .skip(skip) //pagination
      .limit(pageSize) //pagination
      .lean(); //lean: returns a plain JavaScript object, strips out all mongoose id and metadata

    //get the total number of documents
    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total, //total number of documents
        page, //current page number
        pages: Math.ceil(total / pageSize), //total number of pages
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    //500: Internal server error
    res.status(500).send({ message: "Internal server error" });
  }
};

export default { searchRestaurants, getRestaurant };
