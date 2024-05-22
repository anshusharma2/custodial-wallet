import web3Instance from "../constants/web3";

export async function readBlock(blockNumber:bigint) {
    try {
        const block = await web3Instance.eth.getBlock(blockNumber);
        console.log(block);
    } catch (error) {
        console.error("Error reading block:", error);
    }
}