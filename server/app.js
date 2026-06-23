import express from "express";
import cors from "cors";
import roomRoutes from
"./src/routes/roomRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import messageRoutes from
"./src/routes/messageRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


app.use(
  "/api/rooms",
  roomRoutes
);
app.use(
  "/api/messages",
  messageRoutes
);
export default app;