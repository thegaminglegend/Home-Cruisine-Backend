import express from "express";
import multer from "multer";
import MyRestrauntController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

//Multer Store image in memory
const storage = multer.memoryStorage();
//Validate image size
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.post(
  "/",
  upload.single("imageFile"), //Check binary image in request, store image in memory, put image in req.file
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestrauntController.createMyRestraunt
);

export default router;
