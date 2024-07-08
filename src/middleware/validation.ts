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
