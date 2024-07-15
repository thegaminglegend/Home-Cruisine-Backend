//Routes dealing with all restaurants
import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

//
router.get(
  "/search/:city",
  param("city") //validate the city parameter
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City must be a valid string"),
  RestaurantController.searchRestaurants
);

export default router;
