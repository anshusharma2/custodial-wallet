import mongoose from "mongoose";

// Define schema for Args
const argsSchema = new mongoose.Schema({
  token: { type: String },
  integrator: { type: String },
  integratorFee: { type: String },
  lifiFee: { type: String, default: "" } // Make lifiFee optional with a default value
});

// Define schema for EventDocument
const eventDocumentSchema = new mongoose.Schema({
  blockNumber: { type: Number },
  blockHash: { type: String },
  transactionIndex: { type: Number },
  removed: { type: Boolean },
  address: { type: String },
  data: { type: String },
  topics: { type: [String] },
  transactionHash: { type: String },
  logIndex: { type: Number },
  args: { type: argsSchema }, // Embed the args schema
  event: { type: String },
  eventSignature: { type: String }
});

// Create model for EventDocument
const EventModel = mongoose.model('Event', eventDocumentSchema);

export default EventModel;
