import Room from "../models/Room.js";

export const createRoom = async (
  req,
  res
) => {
  try {

    let roomId;
    let existingRoom;

    do {
      roomId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      existingRoom =
        await Room.findOne({
          roomId,
        });

    } while (existingRoom);

    const room =
      await Room.create({
        roomId,
        owner:
          req.user._id,
      });

    res.status(201).json(
      room
    );

  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

export const getMyRooms =
  async (req, res) => {
    try {

      const rooms =
        await Room.find({
          owner:
            req.user._id,
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      res.json(rooms);

    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };


  export const getRoom =
  async (req, res) => {
    try {

      const room =
        await Room.findOne({
          roomId:
            req.params.roomId,
        }).populate(
          "owner",
          "username email"
        );

      if (!room) {
        return res
          .status(404)
          .json({
            message:
              "Room not found",
          });
      }

      res.json(room);

    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

  export const joinRoom = async (
    req,
    res
  ) => {
    try {
  
      const { roomId } =
        req.body;
  
      const room =
        await Room.findOne({
          roomId,
        });
  
      if (!room) {
        return res.status(404).json({
          message:
            "Room not found",
        });
      }
  
      res.json({
        success: true,
        room,
      });
  
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };