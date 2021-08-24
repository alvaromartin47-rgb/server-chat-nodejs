import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import bot from './bot';
import userConnection from './models/userConnection';

import { 

    eliminarConexion,
    registrarConexion,
    autenticarConexion,
    validarRespuestaTelegram

} from './functions';

// HTTP

const app = express();
const server = http.createServer(app);

// Websocket

const io = SocketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', socket => {
    let socketId = socket.id;
    let idChat = 0;
    let name;

    socket.on('auth', async (nameUser) => {
        const data = await autenticarConexion(nameUser);
        idChat = data.idChat;
        name = data.name;
        registrarConexion(idChat, name, socketId);
    });
        
    socket.on('message', (user) => {
        const msj = "From: " + name + "\n" + "ID: @" + idChat + "\n" + "Message: " + user.text;
        bot.telegram.sendMessage(process.env.CHAT_ID_ADMIN, msj);
    });

    socket.on('disconnect', async () => {
        await eliminarConexion(socketId);
    });

    bot.on('text', async (ctx) => {
        try {
            
            const { idChat, msjChat } = await validarRespuestaTelegram(ctx);
            const responseFind = await userConnection.find({idChat});
            io.to(responseFind[0].socketId).emit('message', msjChat);

        } catch (error) { bot.telegram.sendMessage(process.env.CHAT_ID_ADMIN, error) }
    });
});

export default server;