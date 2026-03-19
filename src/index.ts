import { Bot, webhookCallback } from 'grammy';
import kapusha from './kapusha';


interface Env {
	BOT_TOKEN: string;
	USERS: KVNamespace;
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
		bot.use(async (ctx, next) => {
			const userId = ctx.from?.id;
			if (userId) {
				const userData = {
					name: ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim(),
					lastActive: Date.now()
				};
				await env.USERS.put(userId.toString(), JSON.stringify(userData));
			}
			await next();
		});

		bot.hears(/^\/stats$/i, async (ctx) => {
			const list = await env.USERS.list();
			const users = await Promise.all(list.keys.map(async (key) => {
				const value = await env.USERS.get(key.name);
				return value ? JSON.parse(value) : null;
			}));
			const activeUsers = users.filter(u => u && (Date.now() - u.lastActive) < 24 * 60 * 60 * 1000);
			const totalUsers = `Всего пользователей: ${users.length}`;
			const last24h = `Активных за последние 24 часа: ${activeUsers.length}`;
			const topActive = activeUsers.sort((a, b) => b.lastActive - a.lastActive).slice(0, 5).map(u => `<a href="tg://user?id=${u.id}">${u.name}</a> (${new Date(u.lastActive).toLocaleString()})`).join('\n');
			await ctx.reply([last24h, topActive, totalUsers].join('\n'), { parse_mode: "HTML" });
		});

		const handleUpdate = webhookCallback(bot, 'cloudflare-mod');

		try {
			return await handleUpdate(request);
		} catch (err) {
			console.error(err);
			return new Response('Internal Error', { status: 500 });
		}
	},
};
