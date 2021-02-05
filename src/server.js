import express from 'express';
import http from 'http';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
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
app.use(cors);
const server = http.createServer(app);

const schema = {};

// app.get("/", (req, res) => {
//     res.json({
//         message:"hola"
//     })
// });

// app.use(express.static("/home/alvaro/Escritorio/fronted-react/build"));

app.use("/graphql", graphqlHTTP({
    graphiql: true,
    schema: schema
}));

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
        bot.telegram.sendMessage(855202158, msj);
    });

    socket.on('disconnect', async () => {
        await eliminarConexion(socketId);
    });

    bot.on('text', async (ctx) => {
        try {
            
            const { idChat, msjChat } = await validarRespuestaTelegram(ctx);
            const responseFind = await userConnection.find({idChat});
            io.to(responseFind[0].socketId).emit('message', msjChat);

        } catch (error) { bot.telegram.sendMessage(855202158, error) }
    });
});

export default server;