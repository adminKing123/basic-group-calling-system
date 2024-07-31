const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Endpoint to serve index.html
app.get("/:room/connect", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    socket.to(room).emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      socket.to(room).emit("user-disconnected", socket.id);
    });

    socket.on("send-signal", ({ signal, userId }) => {
      io.to(userId).emit("receive-signal", { signal, userId: socket.id });
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
