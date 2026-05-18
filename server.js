const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:"*"
    }
});

app.use(express.static("public"));

const occupiedRadios = {};

io.on("connection", socket => {

    socket.on("join-channel", channel => {

        socket.join(channel);

        socket.channel = channel;

        const clients =
            Array.from(
                io.sockets.adapter.rooms.get(channel) || []
            );

        socket.emit("all-users",
            clients.filter(id => id !== socket.id)
        );
    });

    socket.on("sending-signal", payload => {

        io.to(payload.userToSignal).emit(
            "user-joined",
            {
                signal: payload.signal,
                callerID: payload.callerID
            }
        );
    });

    socket.on("returning-signal", payload => {

        io.to(payload.callerID).emit(
            "receiving-returned-signal",
            {
                signal: payload.signal,
                id: socket.id
            }
        );
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server läuft");
});
