import { contract_address } from "../constants";
import { WebsocketInstance } from "../constants/web3";
import abi from "../abi";
import EventModel from "../models/EventModel";

const contract = new WebsocketInstance.eth.Contract(abi, contract_address);

// Read Transfer Events from Contract !


const readTransferEvent = async () => {
  try {
    const subscription = contract.events.Transfer();
    // new value every time the event is emitted
    subscription.on("data", async (data) => {
      const { address, blockHash, blockNumber, transactionHash } = data;
      await EventModel.create({
        address,
        blockNumber,
        transactionHash,
        blockHash,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export { readTransferEvent };
