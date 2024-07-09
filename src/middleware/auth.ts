import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

//Extend Express Request type to include auth0Id and userId
declare global {
  namespace Express {
    interface Request {
      auth0Id: string;
      userId: string;
    }
  }
}

//Middleware to verify JWT token from request
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

//Middleware to parse JWT token to get UserID
export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  //Check if request has authorization header
  if (!authorization || !authorization.startsWith("Bearer ")) {
    //401: Unauthorized
    return res.sendStatus(401);
  }

  //Parse token from authorization header (element after "Bearer")
  const token = authorization.split(" ")[1];

  try {
    //Decode token to get payload
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub; //sub is auth0Id in the token

    //find the user with the auth0Id in DB
    const user = await User.findOne({ auth0Id });
    if (!user) {
      //401: Unauthorized
      return res.sendStatus(401);
    }

    //If user exists set auth0Id and userId in request body
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString(); //MongoDB ID
    next();
  } catch (error) {
    //Dont give too many clues what is wrong with backend to prevent hackers
    //401: Unauthorized
    return res.sendStatus(401);
  }
};
