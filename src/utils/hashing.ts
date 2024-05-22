import bcrypt from "bcryptjs";
import { SALT_ROUND } from "../constants/env";

export const generateHash = async (input: string) : Promise<string> => {
  return new Promise(async (resolve, reject) => {
    var salt = await bcrypt.genSalt(Number(SALT_ROUND));
    bcrypt.hash(input, salt, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};
