import dotenv from "dotenv";
import http from "http";

import { Server }
from "socket.io";

import app from "./app.js";
import connectDB
from "./src/config/db.js";

import chatSocket
from "./src/socket/chatSocket.js";

dotenv.config();

await connectDB();

const server =
  http.createServer(app);

const io = new Server(
  server,
  {
    cors: {
      origin: "*",
    },
  }
);

chatSocket(io);

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});