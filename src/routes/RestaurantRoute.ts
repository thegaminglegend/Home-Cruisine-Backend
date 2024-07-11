//Routes dealing with all restaurants
import express from "express";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

//
router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City must be a valid string"),
  RestaurantController.searchRestaurants
);
