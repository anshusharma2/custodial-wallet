import { NextFunction, Response } from "express";
import { JWT_SECRET } from "../constants/env";
import { CustomRequest } from "../controller/User";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyJWT } from "../utils/Jwt";

export const authUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    const id = verifyJWT(token as string, JWT_SECRET);
    req.id = id?._id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse("User is not authenticated", null, 401));
  }
};
