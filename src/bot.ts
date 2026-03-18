import { Bot } from 'grammy';
import kapusha from './kapusha';

const token = process.env.BOT_TOKEN;

if (!token) {
	throw new Error("BOT_TOKEN is not defined");
}

const bot = kapusha(new Bot(token));

console.log("Bot run long polling...");
bot.start();