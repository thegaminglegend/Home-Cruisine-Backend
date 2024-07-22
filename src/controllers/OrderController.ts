import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[]; //array of cart items
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    //get the request body
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    //find the restaurant by id
    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    //if restaurant not found
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    //create line items for the cart items
    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    //create a checkout session
    const session = await createSession(
      lineItems,
      "TEST_ORDER_ID",
      restaurant.deliveryPrice,
      restaurant.id.toString()
    );

    //defensive programming
    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    res.json({ url: session.url });
  } catch (error: any) {
    //500: Internal Server Error
    console.error(error);
    //send raw strip error message
    res.status(500).json({ message: error.raw.message });
  }
};

//function to create line items for the cart items
const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  //loop through the cart items and create line items for each of the cart items
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    //loop through the menu item of the restaurant to find the menuItem id that matches
    //with the item in the cart
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    //if menuItem not found
    //Not likely but for defensive programming
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    //Convert it to a stripe line item
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

//function to create a checkout session
const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  //Call strip funciton to create a session
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    //send the user to this url after payment successful
    success_url: `${FRONTEND_URL}/order-status?sucess=true`,
    //send the user back to restuarant details page after payment failed or cancelled
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

export default { createCheckoutSession };
