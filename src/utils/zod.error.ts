import { Response } from "express";
import { ZodError } from "zod";

export function sendZodError(res: Response, error: ZodError): void {
    res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map((err) => err.message),
    });
  }