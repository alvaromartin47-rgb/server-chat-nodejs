import express from 'express';
import http from 'http';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import SocketIO from 'socket.io';
import bot from './bot';
import userConnection from './models/userConnection';
import chatId from './models/chatId';

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
    socket.on('auth', (nameUser) => {
        let i = 0
        chatId.find().exec((err, data) => {
            if (data.length == 0) {
                const newChatId = new chatId({idChat: 0})
                newChatId.save();
            }
            else {
                const current = data[0].idChat;
                chatId.update({idChat: current}, {$inc: {idChat: current + 1}});
                i = current + 1;
            }
        });
        userConnection.find({username: nameUser}).exec((err, data) => {
            const newUserConnection = new userConnection({
                socketId: socket.id,
                name: nameUser,
                idChat: i
            });
            newUserConnection.save();
        });
    });

    socket.on('message', async (user) => {
        await userConnection.find({socketId: socket.id}).exec((err, data) => {
            const idChat = data[0].idChat;
            const msj = "From: " + data[0].name + "\n" + "ID: @" + idChat + "\n" + "Message: " + user.text;
            bot.telegram.sendMessage(855202158, msj);
        });
    });

    bot.on('text', async (ctx) => {
        const msj = ctx.update.message.text;
        let i = 0;
        for (i; msj[i] != ":"; i++);
        const idChat = msj.slice(1, i);

        await userConnection.find({idChat}).exec((err, data) => {
            const socketId = data[0].socketId;
            io.to(socketId).emit('message', msj.slice(i + 2));
        });
    });
});

export default server;