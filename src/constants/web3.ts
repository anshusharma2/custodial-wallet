import { Web3 } from "web3";

// const web3Instance = new Web3(`https://rpc.ankr.com/eth_holesky`);
const web3Instance = new Web3("https://rpc-mainnet.maticvigil.com/");
// const web3Instance = new Web3(`https://ethereum-holesky-rpc.publicnode.com`);

const WebsocketInstance = new Web3("wss://ethereum-holesky-rpc.publicnode.com");

export { web3Instance, WebsocketInstance };
