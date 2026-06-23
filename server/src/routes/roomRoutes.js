import express from "express";

import protect from
"../middleware/authMiddleware.js";

import {
  createRoom,getMyRooms,getRoom,joinRoom
} from "../controllers/roomController.js";

const router =
  express.Router();

router.post(
  "/create",
  protect,
  createRoom
);


router.get(
  "/my-rooms",
  protect,
  getMyRooms
);

router.get(
  "/:roomId",
  protect,
  getRoom
);

router.post(
  "/join",
  protect,
  joinRoom
);
export default router;