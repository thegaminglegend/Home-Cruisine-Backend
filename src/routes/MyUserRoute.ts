import express from "express";
//Controllers
import MyUserController from "../controllers/MyUserController";
//Midlewares
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
router.post("/", jwtCheck, MyUserController.createCurrentUser);
router.put(
  "/",
  validateMyUserRequest, //Check Request Body, no fields missing
  jwtCheck, //Check token Authorization
  jwtParse, //Check User exists, Get User Info from JWT
  MyUserController.updateCurrentUser
);

export default router;
