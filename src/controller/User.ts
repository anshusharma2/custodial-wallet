import { Response, Request } from "express";
import {
  FORGOT_PASSWORD_VALIDATION,
  LOGIN_VALIDATION,
  RESET_PASSWORD_BODY,
  RESET_PASSWORD_PARAMS,
  SIGNUP_VALIDATION,
  VALIDATE_TRANSFER,
} from "../validation/User.validation";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import User, { comparePassword } from "../models/User";
import ApiError from "../utils/ApiError";
import { IUser } from "../@types";
import { Types } from "mongoose";
import { BASE_URL, JWT_SECRET } from "../constants/env";
import { generateJWT, verifyJWT } from "../utils/Jwt";
import { generateHash } from "../utils/hashing";
import web3Instance from "../constants/web3";
import { fromWei } from "web3-utils";
import { Transaction } from "web3";

export interface CustomRequest extends Request {
  id?: string; // Assuming id is a string
}

export default class UserController {
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = FORGOT_PASSWORD_VALIDATION.parse(req.body);
    const isExist = await User.findOne({ email });
    if (!isExist) {
      throw new ApiError(400, "User not found !");
    } else {
      const token = generateJWT(
        isExist as unknown as IUser,
        JWT_SECRET + isExist.password
      );
      const link = `${BASE_URL}/api/reset-password/${isExist.id}/${token}`;
      res
        .status(200)
        .json(
          new ApiResponse(
            "Reset Password Link has been generated ",
            { link },
            200
          )
        );
    }
  });
  // link wull be valid for one use only ! we have also set jwt expiration time to 2 minutes after 2 minute the link will be no longer valid !
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { password } = RESET_PASSWORD_BODY.parse(req.body);
    const { id, token } = RESET_PASSWORD_PARAMS.parse(req.params);
    // const isValid = await comparePassword(password, isExist.password as string);
    const isExist = await User.findById(new Types.ObjectId(id));
    if (!isExist) {
      throw new ApiError(404, "User not found !");
    } else {
      const isValidToken = verifyJWT(token, JWT_SECRET + isExist.password);
      const newPassword = generateHash(password);
      await User.findOneAndUpdate(
        {
          email: isValidToken.email,
        },
        {
          $set: {
            password: newPassword,
          },
        }
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            "Your password has been succesfully reseted !",
            null,
            200
          )
        );
    }
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = LOGIN_VALIDATION.parse(req.body);
    const isExist = await User.findOne({ email });
    if (!isExist) {
      throw new ApiError(404, "User not found !");
    } else {
      const isValid = await comparePassword(
        password,
        isExist.password as string
      );
      const token = generateJWT(isExist as unknown as IUser, JWT_SECRET);
      if (isValid && token) {
        return res
          .status(200)
          .json(new ApiResponse("Login success", { token }, 200));
      }
      throw new ApiError(400, "Invalid Credentials !!");
    }
  });

  static signup = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = SIGNUP_VALIDATION.parse(req.body);
    // we have to hash the password saving it !!'
    const isExist = await User.findOne({ email });
    if (isExist) {
      throw new ApiError(400, "User already exist !");
    } else {
      await User.create({
        email,
        password,
        name,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(
            "You have been successfully sign up !",
            { email, password, name },
            200
          )
        );
    }
  });
  static userDetails = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      // we have to hash the password saving it !!'
      const isExist = await User.findById(
        new Types.ObjectId(req?.id as string)
      ).select("-password");
      // console.log(isExist,"asdsa");
      if (!isExist) {
        throw new ApiError(400, "User not found !");
      }
      return res
        .status(200)
        .json(
          new ApiResponse("You have been successfully sign up !", isExist, 200)
        );
    }
  );
  static Transfer = asyncHandler(async (req: CustomRequest, res: Response) => {
    // we have to hash the password saving it !!'

    const { address, amount } = VALIDATE_TRANSFER.parse(req.body);

    const amountToSend = web3Instance.utils.toWei(String(amount), "ether"); // Sending ETH

    const userAccount = await User.findById(
      new Types.ObjectId(req?.id as string)
    ).select("-password");

    if (!userAccount) {
      throw new ApiError(400, "User not found !");
    }

    const account = web3Instance.eth.accounts.wallet
      .add(userAccount?.wallet_key as string)
      .get(0);

    const userBalance = await web3Instance.eth.getBalance(
      account?.address as string
    );
    console.log(account, "account");
    console.log(userAccount, "useraccount");

    const userBalanceEther = fromWei(userBalance, "ether");
    // const baseFeePerGas = (await web3Instance.eth.getBlock())
    // .baseFeePerGas as bigint;
    // const maxFeesAllowance = baseFeePerGas * BigInt(2);

    const nonce = await web3Instance.eth.getTransactionCount(
      account?.address as string,
      "latest"
    ); // Get the nonce

    const gasPrice = await web3Instance.eth.getGasPrice(); // Get current gas price

    // const nonce = await web3Instance.eth.getTransactionCount(
    //   account?.address as string
    // );

    console.log(account?.address, "whosisender");
    console.log(userBalanceEther);
    console.log(userBalance, "user balance");

    console.log(amount);
    console.log(fromWei(gasPrice, "ether"), "gasPrice");
    console.log(
      Number(userBalanceEther) > Number(fromWei(gasPrice, "ether")) + amount,
      "Have enough amount "
    );

    // let haveEnoughtBalance =
    //   Number(userBalanceEther) > Number(fromWei(gasPrice, "ether")) + amount;
    // if (!haveEnoughtBalance) {
    //   throw new ApiError(
    //     400,
    //     "You dont have enough Amount for the transaction ~"
    //   );
    // }

    // Calculate the total amount to be sent including gas fees
    const totalAmountToSend =
      Number(amount) + Number(fromWei(gasPrice, "ether"));

    // Check if the user has enough balance to cover the transaction
    // if (Number(userBalanceEther) < totalAmountToSend) {
    //   throw new ApiError(
    //     400,
    //     "You don't have enough balance to perform this transaction."
    //   );
    // }

    console.log("account?.address", account?.address);

    // Fetch the latest base fee per gas from the latest block
    const latestBlock = await web3Instance.eth.getBlock("latest");
    const baseFeePerGas = latestBlock.baseFeePerGas;

    // Set the max priority fee per gas
    const maxPriorityFeePerGas = web3Instance.utils.toWei("1", "gwei"); // Example priority fee

    // Calculate the max fee per gas
    const maxFeePerGas = (
      BigInt(baseFeePerGas as bigint) + BigInt(maxPriorityFeePerGas)
    ).toString();

    const estimatedGasLimit = await web3Instance.eth.estimateGas({
      from: userAccount?.wallet_address as string,
      to: address,
      value: amountToSend.toString(),
    });
    console.log(estimatedGasLimit * BigInt(2));

    // Make a raw transaction object
    const rawTransaction = {
      from: userAccount.wallet_address,
      to: address,
      value: amountToSend.toString(),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      gasLimit: estimatedGasLimit * BigInt(2),
      nonce: nonce.toString(),
      data: "0x0",
    } as unknown as Transaction;

    // Estimate gas required for the transaction
    console.log(rawTransaction);

    // console.log(web3Instance.utils.fromWei(maxFeesAllowance.(), 'gwei'),"gasss");

    // //  - sign the raw transaction with the private key
    const signedTransaction = await web3Instance.eth.accounts.signTransaction(
      rawTransaction,
      userAccount?.wallet_key as string
    );

    console.log(signedTransaction, "signedTransaction");

    // //  - send the signed transaction
    const txReceipt = await web3Instance.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    console.log(txReceipt, "tx");

    return res
      .status(200)
      .json(new ApiResponse("You Transaction has been successfully completed !", txReceipt, 200));
  });
}
