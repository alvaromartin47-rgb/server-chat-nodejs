import { Telegraf } from 'telegraf';
import env from 'node-env-file';
env("/home/alvaro/pr/web/chat-nodejs/server-chat-nodejs/.env");

const TOKEN = process.env.TOKEN;

const bot = new Telegraf(TOKEN);

// bot.command('start', (ctx) => ctx.reply('Hello'))

export default bot;