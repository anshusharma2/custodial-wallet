import express from "express";
import { connectDB } from "./config/data.config";
import { errorHandler } from "./middewares/error.handler";
import cron from 'node-cron';

import UserRouter from "./router/User";
import { PORT as port } from "./constants/env";
import { readTransferEvent } from "./cron/ReadEventsFromContract";
import fetchPastLogs from "./cron/ReadPastEvents";
import { scanEvents } from "./services/blockscanner";
// import ApiError from "./utils/ApiError";
async function init() {
  const app = express();
  const PORT = Number(port) || 8000;
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "Server is running !~! " });
  });

  app.use("/api", UserRouter);
  // Middleware for handling 404 errors
 
  // this will handle all the error !!
  //  we will through all error to this middleware !!
  app.use(errorHandler);

  app.listen(PORT, () => console.info(`Server started at PORT:${PORT}`));
}

connectDB();

init();

// fetchPastLogs()

// readTransferEvent()

cron.schedule('*/5 * * * * *', async () => {
  await  scanEvents()
});