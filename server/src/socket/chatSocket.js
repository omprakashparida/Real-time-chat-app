import Message from "../models/Message.js";
import Room from "../models/Room.js";

const onlineUsers = {};

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Handle sending a new message
    socket.on("chatMessage", async ({ roomId, userId, content }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        const message = await Message.create({
          room: room._id,
          sender: userId,
          content,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "username"
        );

        io.to(roomId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.log(error);
      }
    });

    // Handle user joining a room
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);

      onlineUsers[socket.id] = {
        username,
        roomId,
      };

      const roomUsers = Object.values(onlineUsers).filter(
        (user) => user.roomId === roomId
      );

      io.to(roomId).emit("onlineUsers", roomUsers);
      console.log(`${username} joined ${roomId}`);
    });

    // Handle loading previous messages
    socket.on("loadMessages", async (roomId) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;

        const messages = await Message.find({ room: room._id })
          .populate("sender", "username")
          .sort({ createdAt: 1 });

        socket.emit("messageHistory", messages);
      } catch (error) {
        console.log(error);
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ roomId, username }) => {
      // socket.to() broadcasts to everyone in the room EXCEPT the sender
      socket.to(roomId).emit("typing", { username });
    });

    socket.on("stopTyping", ({ roomId, username }) => {
      socket.to(roomId).emit("stopTyping", { username });
    });
  

    // Handle user disconnect
    socket.on("disconnect", () => {
      const user = onlineUsers[socket.id];

      if (user) {
        delete onlineUsers[socket.id];

        const roomUsers = Object.values(onlineUsers).filter(
          (u) => u.roomId === user.roomId
        );

        io.to(user.roomId).emit("onlineUsers", roomUsers);
      }

      console.log("User disconnected");
    });
  });
};

export default chatSocket;