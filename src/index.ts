import { Bot, webhookCallback } from 'grammy';
import { setup } from './kapusha';


export interface Env {
	BOT_TOKEN: string;
}


export default {
	async fetch(request: Request, env: { BOT_TOKEN: string }, ctx: ExecutionContext) {
		if (!env.BOT_TOKEN) {
			throw new Error("BOT_TOKEN is not defined");
		}

		const bot = new Bot(env.BOT_TOKEN);
		setup(bot);
		const handleUpdate = webhookCallback(bot, 'cloudflare-mod');

		try {
			return await handleUpdate(request);
		} catch (err) {
			console.error(err);
			return new Response('Internal Error', { status: 500 });
		}
	},
};
