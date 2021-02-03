import express from 'express';
import http from 'http';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import SocketIO from 'socket.io';
import bot from './bot';

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
    console.log('socket connected:', socket.id);

    socket.on('message', (newMessage) => {
        console.log("received from client: ", newMessage);
        bot.telegram.sendMessage(855202158, newMessage);
    });

    bot.on('text', (ctx) => {
        console.log(ctx)
        socket.emit('message', ctx.update.message.text);
    });
});

export default server;