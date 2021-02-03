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

    // bot.on('text', () => {
    //     socket.emit('message', newMessage);
    // });
});
