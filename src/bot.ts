import { Bot } from 'grammy';
import { setup } from './kapusha';

const token = process.env.BOT_TOKEN;

if (!token) {
	throw new Error("BOT_TOKEN is not defined");
}

const bot = new Bot(token);
setup(bot);

console.log("Bot run long polling...");
bot.start();