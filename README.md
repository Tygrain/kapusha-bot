# Kapusha Bot

Телеграм-бот, работающий на Cloudflare Workers с использованием библиотеки [grammY](https://grammy.dev/).

## Настройка

Для работы бота необходимо получить токен у [@BotFather](https://t.me/BotFather).

1. Создайте файл `.dev.vars` в корне проекта (он игнорируется git).
2. Добавьте в него ваш токен:
   ```
   BOT_TOKEN=ваш_токен_здесь
   ```

## Режимы разработки

Проект поддерживает два режима работы для локальной разработки.

### 1. Режим Webhooks (рекомендуется для Cloudflare Workers)
В этом режиме бот работает как HTTP-сервер, который получает обновления от Telegram через вебхуки.

**Запуск:**
```bash
npx wrangler dev
```
По умолчанию сервер запустится на `http://localhost:8787`.

**Туннелирование:**
Так как Telegram должен отправлять запросы на ваш локальный сервер по HTTPS, необходимо создать туннель.

Используя Cloudflare Tunnel:
```bash
npx cloudflared tunnel --url http://localhost:8787
```
Или используя `ngrok`:
```bash
ngrok http 8787
```

**Регистрация вебхука:**
После получения временного HTTPS-адреса от туннеля, его нужно зарегистрировать в Telegram API:
`https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={ВАШ_HTTPS_АДРЕС}`

### 2. Режим Polling
В этом режиме бот сам подключается к серверам Telegram для получения обновлений. Это проще для быстрой разработки, так как не требует туннелирования и настройки вебхуков.

**Запуск:**
```bash
npm start
```

## Деплой

Для деплоя бота в Cloudflare Workers:

1. Опубликуйте воркер:
   ```bash
   npm run deploy
   ```
2. Установите секрет `BOT_TOKEN` в настройках Cloudflare:
   ```bash
   npx wrangler secret put BOT_TOKEN
   ```
3. Зарегистрируйте URL вашего опубликованного воркера в Telegram через `setWebhook` (аналогично разделу про Webhooks).
