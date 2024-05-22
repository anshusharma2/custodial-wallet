import { z } from "zod";

export const LOGIN_VALIDATION = z.object({
  email: z.coerce.string({ required_error: "Email is Required" }).email(),
  password: z.string({ required_error: "Password is Required" }).min(5),
});

export const SIGNUP_VALIDATION = z.object({
  name: z.string({ required_error: "Name is Required" }),
  email: z.coerce.string({ required_error: "Email is Required" }).email(),
  password: z.string({ required_error: "Password is Required" }).min(5),
});
export const FORGOT_PASSWORD_VALIDATION = z.object({
  email: z.coerce.string({ required_error: "Email is Required" }).email(),
});
export const RESET_PASSWORD_BODY = z.object({
  password: z.string({ required_error: "Password is Required" }).min(5),
});
export const RESET_PASSWORD_PARAMS = z.object({
  id: z.string({ required_error: "Id is Required" }),
  token: z.string({ required_error: "Token is Required" }),
});
export const VALIDATE_TRANSFER = z.object({
  address: z.string({ required_error: "Address is Required to send the transaction !" }),
  amount: z.number({ required_error: "Amount is Required" }),
});
