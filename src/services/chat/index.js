import './database';
import server from './server';
import bot from './bot';
import env from 'node-env-file'
env("/home/alvaro/pr/web/chat-nodejs/server-chat-nodejs/.env");

bot.launch();

server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});
