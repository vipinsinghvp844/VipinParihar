import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map(); //userId => socket.id 

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
   console.log("Incoming connection with userId:", userId);

   if (userId) {
    console.log("User connected:", userId);
    onlineUsers.set(userId, socket.id); // Pehle user ko map me daalein

    // Ab correct online list bhejein
    socket.emit("initial-online-users", Array.from(onlineUsers.keys()));

    io.emit("user-online", { userId }); // Broadcast
  }
    
    // In case frontend missed emitting "user-online"
    socket.on("user-online", (uid) => {
      onlineUsers.set(uid, socket.id);
      io.emit("user-online", { userId: uid });
    });

    socket.on("user-offline", (uid) => {
      onlineUsers.delete(uid);
      io.emit("user-offline", { userId: uid });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user-offline", { userId });
    });
  

  // send message and received message 
  socket.on("msg", (data) => {
    // broadcast to all except sender
    socket.broadcast.emit("msgFromServer", data);
  });
  // Last message in sidebar

  socket.on("msg", (data) => {

    socket.broadcast.emit("lstMsgFromServer", data);
  })

  // edit message 
  socket.on("editMsg", (data) => {
    socket.broadcast.emit("editMsgFromServer", data);
  });
  // update Read Status 
  socket.on("readMsg", (data) => {
    socket.broadcast.emit("readMsgFromServer", data);
  })
  //delete Message
  socket.on("deleteMsg", (data) => {
    socket.broadcast.emit("deleteMsgFromServer", data);
  })

});

httpServer.listen(3000, () => {
  console.log("Server listening on port 3000");
});