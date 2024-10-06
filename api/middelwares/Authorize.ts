// All required import
import express from "express";
import asyncHandler from "express-async-handler";
import Jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import User from "../models/User";

// * verifyAuthentication Middleware
export const verifyAuthentication = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // 1 - get token
    let token: string = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return next(new ApiError(401, "please login first"));
    }
    // 2 - decoded token
    const decodedToken: any = Jwt.verify(token, process.env.JWT_KEY!);
    // 3 - check if user still exists in db
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return next(new ApiError(404, "user not found"));
    }
    // 4 - check change password
    if (user.passwordChangedAt instanceof Date) {
      const changeTime: number = parseInt(
        (user.passwordChangedAt.getTime() / 1000).toString()
      );
      if (changeTime > decodedToken.iat) {
        return next(new ApiError(401, "please login again"));
      }
    }
    req.user = user;
    next();
  }
);
// * verifyActivity Middleware
export const verifyActivity = asyncHandler(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user.active) {
      return next(new ApiError(403, "You Are Not Active !"));
    }
    next();
  }
);
// * allowedTo Middleware
export const allowedTo = (...roles: string[]) =>
  asyncHandler(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (!roles.includes(req.user?.role!)) {
        return next(new ApiError(403, "You Are Not Allowed To Do That !"));
      }
      next();
    }
  );