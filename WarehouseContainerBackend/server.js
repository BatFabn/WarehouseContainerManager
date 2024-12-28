const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

let value = 0;

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit new data every second
  setInterval(() => {
    value = Math.random() * Math.random(); // Generate random data
    socket.emit("newData", value); // Send data to the client
  }, 1000);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
