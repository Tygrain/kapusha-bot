# Kapusha Bot

This is an example of a simple Telegram bot that works on the **Cloudflare Workers** platform.
It is a port of a similar JavaScript bot by [celtudson](https://github.com/celtudson).

The bot is built using the [grammY](https://grammy.dev/) framework.

## Setup

To run the bot, you need a token from [@BotFather](https://t.me/BotFather).

1. Create a file named `.dev.vars` in the root folder.
2. Add your token there:
   ```
   BOT_TOKEN=your_token_here
   ```

## Development Modes

There are two ways to run the bot locally for development.

### 1. Webhooks Mode (Recommended for Cloudflare Workers)
In this mode, the bot works as a web server and receives updates from Telegram.

**Run:**
```bash
npx wrangler dev
```
The server will start at `http://localhost:8787`.

**Tunneling:**
Telegram needs to send requests to your computer via HTTPS. You must use a tunnel.

Using Cloudflare Tunnel:
```bash
npx cloudflared tunnel --url http://localhost:8787
```
Or using `ngrok`:
```bash
ngrok http 8787
```

**Register Webhook:**
After you get a temporary HTTPS address from the tunnel, tell Telegram to use it:
`https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={YOUR_HTTPS_URL}`

### 2. Polling Mode
In this mode, the bot connects to Telegram to ask for updates. This is easier because you don't need a tunnel.

**Run:**
```bash
npm start
```

## Deployment

To deploy the bot to Cloudflare Workers:

1. Publish the worker:
   ```bash
   npm run deploy
   ```
2. Set your `BOT_TOKEN` secret in Cloudflare:
   ```bash
   npx wrangler secret put BOT_TOKEN
   ```
3. Register your production worker URL in Telegram using `setWebhook` (same way as in the Webhooks section).
