import { InferSchemaType } from "mongoose";
import { UserSchema } from "../models/User";

export interface IEMAIL {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface ErrorDetail {
  // Define the structure of each error detail
  // For example:
  field: string;
  message: string;
}

export interface IApiError extends Error {
  statusCode: number;
  data: any | null;
  message: string;
  success: boolean;
  errors: ErrorDetail[];
}

export type IUser = InferSchemaType<typeof UserSchema> & {
  _id: string;
};

export type TJWT_TOKEN = {
  _id: string;
  email: string;
  name: string;
  iat: number;
};
