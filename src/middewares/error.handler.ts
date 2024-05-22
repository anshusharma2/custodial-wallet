import mongoose from "mongoose";
import ApiError from "../utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { IApiError } from "../@types";
// import logger from "../logger/winston.logger";
import { sendZodError } from "../utils/zod.error";
import { ZodError } from "zod";
import { NODE_ENV } from "../constants/env";
import { JsonWebTokenError } from "jsonwebtoken";

const errorHandler = (
  err: IApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;
  if (error instanceof ZodError) {
    return sendZodError(res, error);
  }
  if (error instanceof JsonWebTokenError) {
    const message = "Token is Expired now !";
    const statusCode =
      error.statusCode || error instanceof JsonWebTokenError ? 400 : 500;
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }
  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
    // if not
    // create a new ApiError instance to keep the consistency

    // assign an appropriate status code
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    // set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };
  console.log(err);
  

  // Send error response
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
