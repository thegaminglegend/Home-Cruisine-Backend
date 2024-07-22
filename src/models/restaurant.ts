import mongoose, { InferSchemaType } from "mongoose";

//DB schema for menu item
const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(), //generate new id
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

//Define type for menu item with InferSchemaType from mongoose
export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

//DB schema for restaurant
const restaurantSchema = new mongoose.Schema({
  //Reference to the user who created the restaurant
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  //Array of strings
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdate: { type: Date, required: true },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
