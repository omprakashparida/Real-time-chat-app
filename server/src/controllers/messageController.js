import Message from "../models/Message.js";
import Room from "../models/Room.js";

export const getRoomMessages =
  async (req, res) => {
    try {

      const room =
        await Room.findOne({
          roomId:
            req.params.roomId,
        });

      if (!room) {
        return res.status(404).json({
          message:
            "Room not found",
        });
      }

      const messages =
        await Message.find({
          room: room._id,
        })
          .populate(
            "sender",
            "username"
          )
          .sort({
            createdAt: 1,
          });

      res.json(messages);

    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };