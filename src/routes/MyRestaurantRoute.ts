import express from "express";
import multer from "multer";
import MyRestrauntController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyRestrauntController.getMyRestaurantOrders
);
router.get("/", jwtCheck, jwtParse, MyRestrauntController.getMyRestaurant);

//patch: update part of an entity
router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  MyRestrauntController.updateOrderStatus
);

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
  validateMyRestaurantRequest, //Validate all the fields of the body in request
  jwtCheck,
  jwtParse,
  MyRestrauntController.createMyRestaurant
);

//Put: update an entity
router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestrauntController.updateMyRestaurant
);

export default router;
