import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateHash } from "../utils/hashing";
import web3Instance from "../constants/web3";

const Schema = mongoose.Schema;

export const UserSchema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, min: 5, require: true },
  wallet_key: { type: String, require: true },
  wallet_address: { type: String, require: true },
  balance: { type: Number, require: true, default: 110 },
});

// we have to hash the password before saving it !!

UserSchema.pre("save", async function (next) {
  const password = this.password as string;
  this.password = await generateHash(password);
  let { address, privateKey } = web3Instance.eth.accounts.create();
  this.wallet_key = privateKey;
  this.wallet_address = address;
  next();
});

export const comparePassword = async (password: string, hash: string) => {
  return new Promise((res, reject) => {
     bcrypt.compare(password, hash, (err, success) => {
      if (err) {
        reject(err);
      } else {
        res(success);
      }
    });
  });
};

const User = mongoose.model("User", UserSchema);

export default User;
