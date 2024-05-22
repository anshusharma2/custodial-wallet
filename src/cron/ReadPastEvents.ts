import { web3Instance } from "../constants/web3";
const fetchPastLogs = async () => {
  const currentBlock = await web3Instance.eth.getBlockNumber(); // Get the latest block number
  let lastFetchedBlock = 0; // Keep track of the last fetched block number

  let logs = await web3Instance.eth.getPastLogs({});
  console.log(logs);
};

export default fetchPastLogs;
