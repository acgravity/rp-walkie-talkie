const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static("public"));

io.on("connection", socket => {

    socket.on("join-channel", channel => {
        socket.join(channel);
        socket.channel = channel;
    });

    socket.on("radio-start", () => {
        socket.to(socket.channel).emit("radio-start");
    });
    
    socket.on("voice", data => {
        socket.to(socket.channel).emit("voice", data);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server läuft auf Port " + PORT);
});
