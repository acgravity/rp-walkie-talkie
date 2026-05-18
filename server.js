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

/* PUBLIC ORDNER */

app.use(express.static("public"));

/* BESETZTE FUNKGERÄTE */

const occupiedRadios = {};

/* SOCKET VERBINDUNG */

io.on("connection", socket => {

    console.log("User verbunden:", socket.id);

    /* FUNKSOUND */

    socket.on("radio-click", channel => {

        socket.to(channel).emit(
            "play-radio-click"
        );
    });

    /* FUNKGERÄT RESERVIEREN */

    socket.on("claim-radio", radioId => {

        if(occupiedRadios[radioId]){

            socket.emit("radio-busy");

            return;
        }

        occupiedRadios[radioId] = socket.id;

        socket.radioId = radioId;

        socket.emit("radio-approved");

        console.log(
            "Radio reserviert:",
            radioId
        );
    });

    /* CHANNEL BETRETEN */

    socket.on("join-channel", channel => {

        socket.join(channel);

        socket.channel = channel;

        const clients =
            Array.from(
                io.sockets.adapter.rooms.get(channel) || []
            );

        /* AKTUELLE USER SENDEN */

        socket.emit(
            "all-users",
            clients.filter(
                id => id !== socket.id
            )
        );

        /* ANDERE USER INFORMIEREN */

        socket.to(channel).emit(
            "user-joined",
            socket.id
        );

        console.log(
            "User beigetreten:",
            socket.id,
            "=>",
            channel
        );
    });

    /* WEBRTC SIGNAL */

    socket.on("signal", data => {

        io.to(data.to).emit(
            "signal",
            {
                signal:data.signal,
                from:socket.id
            }
        );
    });

    /* DISCONNECT */

    socket.on("disconnect", () => {

        console.log(
            "User getrennt:",
            socket.id
        );

        if(socket.radioId){

            delete occupiedRadios[
                socket.radioId
            ];

            console.log(
                "Radio freigegeben:",
                socket.radioId
            );
        }
    });

});

/* SERVER START */

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        "Server läuft auf Port",
        PORT
    );
});
