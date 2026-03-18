import { Bot, webhookCallback } from 'grammy';
import kapusha from './kapusha';


interface Env {
	BOT_TOKEN: string;
}


export default {
	async fetch(request: Request, env: Env) {
		if (!env.BOT_TOKEN) {
			throw new Error("BOT_TOKEN is not defined");
		}

		if (request.method !== 'POST') {
			throw new Error('Invalid request method');
		}

		const bot = kapusha(new Bot(env.BOT_TOKEN));
		const handleUpdate = webhookCallback(bot, 'cloudflare-mod');

		try {
			return await handleUpdate(request);
		} catch (err) {
			console.error(err);
			return new Response('Internal Error', { status: 500 });
		}
	},
};
