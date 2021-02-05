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

function registrarConexion(idChat, name, socketId) {
    const body = {
        idChat,
        name,
        socketId
    }

    const newUserConnection = new userConnection(body);
    newUserConnection.save();
}

async function autenticarConexion(nameUser) {
    const response = await chatId.find();
    
    if (response.length == 0) {
    
        const newChatId = new chatId({idChat: 0})
        await newChatId.save();
        return {idChat: 0, name: nameUser}
    
    } else {
    
        const current = response[0].idChat;
        const dataUpdate = await chatId.findByIdAndUpdate(response[0]._id, {idChat: current + 1});
        return {idChat: current + 1, name: nameUser}
    
    }
}

async function eliminarConexion(socketId) {
    const responseFind = await userConnection.find({socketId});
    const responseDelete = await userConnection.findByIdAndDelete(responseFind[0]._id);
    return responseDelete._id;
}

function validarRespuestaTelegram(ctx) {
    return new Promise((resolve, reject) => {
        const msj = ctx.update.message.text;
        if (msj[0] != '@') return reject("Error, falta el caracter '@'");
    
        let i = 0;
        
        for (i; msj[i] != ":" && i < msj.length; i++);
        
        if (i === msj.length) return reject("Error, falta el caracter ':'");
        if (msj[i + 1] != " ") return reject("Error, falta un espacio entre ':' y tu respuesta.");
        
        const idChat = msj.slice(1, i);
        const msjChat = msj.slice(i + 2);
        resolve({idChat, msjChat});
    
    });
}

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