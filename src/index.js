// import './database';
import SocketIO from 'socket.io';
import server from './server';
import bot from './bot';

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

bot.launch();

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});

