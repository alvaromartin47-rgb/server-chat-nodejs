// import './database';
import server from './server';
import bot from './bot';

bot.launch();

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});
