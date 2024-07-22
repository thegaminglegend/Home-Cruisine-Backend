# HomeCruisine Tulsa

HomeCruisine Tulsa is a full-stack platform designed to bridge the gap between home chefs and food enthusiasts in Tulsa. This innovative platform allows local cooks to register as "restaurants," enabling them to share and sell their homemade culinary creations. Meanwhile, users can explore a variety of home-cooked meals, discover new flavors, and order their favorite dishes with ease.

## Features

- **Restaurant Registration**: Home chefs can sign up as restaurants, creating a profile to showcase their menu, cooking style, and unique offerings.
- **User-Friendly Search**: Users can browse through a diverse selection of homemade meals, filter by cuisine, price, or rating, and find exactly what they're craving.
- **Ordering System**: A seamless ordering process allows users to place orders directly through the platform, supporting local chefs without the hassle.
- **Ratings and Reviews**: After enjoying their meal, users can leave ratings and reviews, helping others make informed decisions and supporting their favorite home chefs.

## Stack

### Front End

- **React/Vite**: Frontend framework
- **Shadcn**: UI Components
- **lucide-react**: Icons
- **Auth0**: User login and security
- **react-query**: Handle API request by managing state like success, loading, error
- **zod**: Form Schema validation working with **react-form-hook** and **shadcn** form

#### Special Shadcn components

- **aspect ratio**: defines a size and can keep all images at the same ratio

### Back End

- **Node/Express**: Backend framework
- **MongoDB/Mongoose**: Database/Database Management
- **express-oauth2-jwt-bearer**: Backend API JWT Auth check with Auth0
- **jsonwebtoken**: Parsing and decoding access token
- **express-validator**: Validation for request body
- **cloudinary**: Image Hosting API integration
- **multer**: Manage Image properties
  --@types/multer required
- **stripe**: SDK for handling stripe transactions

### Services

- **Render**: Front end Back end hosting
- **Cloudinary**: Image Hosting
- **stripe**: Checkout Finance Transactions
