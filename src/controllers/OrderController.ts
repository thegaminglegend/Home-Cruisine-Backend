import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

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

//function to handle stripe webhook
const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    //construct the event
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET //check if request comes from stripe
    );
  } catch (error: any) {
    console.log(error);
    //400: Bad Request
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle event that is successful
  if (event.type === "checkout.session.completed") {
    //get the order id from the metadata and find the order from DB
    const order = await Order.findById(event.data.object.metadata?.orderId);

    //if order not found, defensive programming
    if (!order) {
      //404: Not Found
      return res.status(404).json({ message: "Order not found" });
    }

    //update the order status and add total amount to save in DB
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

//function to handle frontend request of checking out with stripe
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

    //create a new order to be saved in DB
    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    //create line items for the cart items
    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    //create a checkout session
    const session = await createSession(
      lineItems,
      //meta data
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant.id.toString()
    );

    //defensive programming
    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    //wait until order is saved to DB
    await newOrder.save();
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
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    //send the user back to restuarant details page after payment failed or cancelled
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

export default { createCheckoutSession, stripeWebhookHandler };
