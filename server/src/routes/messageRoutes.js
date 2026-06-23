import express from "express";

import protect from
"../middleware/authMiddleware.js";

import {
  getRoomMessages,
} from "../controllers/messageController.js";

const router =
  express.Router();

router.get(
  "/:roomId",
  protect,
  getRoomMessages
);

export default router;