import bot from './bot';
import server from './server';
// import './database';

bot.launch();

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});

