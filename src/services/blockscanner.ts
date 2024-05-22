import FeeCollectorABI from "../abi";
import BlockNumberModel from "../models/BlockNumber";
import EventModel from "../models/EventModel";
import { web3Instance as web3 } from "../constants/web3";

let chain  ={
    chainId: 137,
    rpcUrl: "https://rpc-mainnet.maticvigil.com/",
    feeCollectorAddress: "0xbd6c7b0d2f68c2b7805d88388319cfb6ecb50ea9",
    oldestBlock: 52661447,
};

let feeCollectorContract = new web3.eth.Contract(
  FeeCollectorABI,
  chain.feeCollectorAddress
);

async function getBlockInfo(chain: string) {
  try {
    const blockInfo = await BlockNumberModel.findOne({ chain }).exec();
    console.log(blockInfo);
    
    if (!blockInfo || !blockInfo.blockNumber) {
      return { error: true, data: { blockNumber: 0 } };
    }
    return { error: false, data: blockInfo };
  } catch (error) {
    console.log("Error in catch at getBlockInfo of EventService", error);
    return { error: true, data: { blockNumber: 0 } };
  }
}

async function getStartEndBlock(defaultBlock: number, chain: string) {
  try {
    let fromBlock = defaultBlock;
    const eventBatchSize = 1000;
    const blockInfo = await getBlockInfo(chain);
    if (!blockInfo.error) {
      fromBlock = blockInfo.data.blockNumber + 1;
    }
    const startBlock = fromBlock;
    let currentBlock = Number(await web3.eth.getBlockNumber());
    console.table({
      LATEST_BLOCK: currentBlock,
      LAST_BLOCK_PROCESSED: startBlock,
      BLOCK_DIFFERENCE: currentBlock - startBlock,
      CHAIN: chain,
    });
    currentBlock -= 6;
    let endBlock = startBlock + eventBatchSize;
    if (startBlock + eventBatchSize > currentBlock) {
      endBlock = currentBlock;
    }
    return {
      error: false,
      startBlock,
      endBlock,
    };
  } catch (error) {
    console.log("Error in catch at getStartEndBlock of EventService", error);
    return { error: true, startBlock: 0, endBlock: 0 };
  }
}

export async function scanEvents() {
  try {
    const latestBlockInDb = await getStartEndBlock(
      chain.oldestBlock,
      "polygon"
    );
    console.log(
      "getEventsForIntegratorgetEventsForIntegrator",
      latestBlockInDb
    );

    if (!latestBlockInDb.error) {
      const events = await getEvents(
        latestBlockInDb.startBlock,
        latestBlockInDb.endBlock
      );

      if (events.length) {
        await updateLatestBlock(
          (events[events.length - 1] as any).blockNumber,
          "polygon"
        );

        for (const event of events) {
          await processEvent(event as unknown as any);
        }
      } else {
        await updateLatestBlock(latestBlockInDb.endBlock, "polygon");
      }
      console.info(
        `Scanned ${events.length} events and stored them in the database.`
      );
    }
  } catch (error) {
    console.error(`Error during event scanning: ${error}`);
  }
}

async function getEvents(startBlock: number, endBlock: number) {
  return feeCollectorContract.getPastEvents("ALLEVENTS",{
    fromBlock: startBlock,
    toBlock: endBlock,
  });
  // return feeCollectorContract.getPastEvents('FeesCollected', {
  //   fromBlock: startBlock,
  //   toBlock: endBlock
  // });
}

async function processEvent(event: Record<string, any>) {
  console.log("eventevent", event);
  if (!event || !event.returnValues) {
    return;
  }
  const args = {
    token: event.returnValues._token,
    integrator: event.returnValues._integrator,
    integratorFee: event.returnValues._integratorFee,
    lifiFee: event.returnValues._lifiFee,
  };
  const eventDocument = new EventModel({
    blockNumber: Number(event.blockNumber),
    blockHash: event.blockHash,
    transactionIndex: Number(event.transactionIndex),
    removed: event.removed,
    address: event.address,
    data: event.raw.data,
    topics: event.raw.topics,
    transactionHash: event.transactionHash,
    logIndex: Number(event.logIndex),
    args: args,
    event: event.event,
    eventSignature: event.signature,
  });
  await eventDocument.save();
}

async function updateLatestBlock(latestBlock: number, chain: string) {
  try {
    const updatedBlock = await BlockNumberModel.findOneAndUpdate(
      { chain },
      { $set: { blockNumber: Number(latestBlock) } },
      { upsert: true }
    ).exec();
    if (updatedBlock) {
      return { error: true };
    }
    return { error: false };
  } catch (err) {
    console.log("Error in catch at upsertBlockInfo ", err);
    return { error: true };
  }
}
