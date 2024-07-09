import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

//Middleware to handle validation errors
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get validation error results
  const errors = validationResult(req);

  //Check if there is errors
  if (!errors.isEmpty()) {
    //400: Bad Request
    return res.status(400).json({ errors: errors.array() });
  }

  //If no errors call next middleware pass reqest on
  next();
};

//Validation of request body for updating User Profile
export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];

//Validation of request body for creating a new Restaurant
export const validateMyRestaurantRequest = [
  body("restaurantName").notEmpty().withMessage("Restaurant Name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery Price must be a positive number"),
  body("estimatedDeliveryTime")
    .isInt({ min: 0 })
    .withMessage("Estimated Delivery Time must be a positive integer"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines must not be empty"),
  body("menuItems").isArray().withMessage("Menu Items must be an array"),
  body("menuItems.*.name").notEmpty().withMessage("Menu Item Name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu Item Price is required and must be a positive number"),
  handleValidationErrors,
];
