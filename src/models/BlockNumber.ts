import mongoose from "mongoose";
// Define schema
const blockNumberSchema = new mongoose.Schema({
  blockNumber: { type: Number, required: true, default: null },
  chain: { type: String, required: true, default: null }
});

// Create model
const BlockNumberModel = mongoose.model('BlockNumber', blockNumberSchema);

export default BlockNumberModel;
