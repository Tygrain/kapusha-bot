import { Bot, InlineKeyboard, Context } from 'grammy';
import { disassembleMatch, doRolls, type RollResult } from './diceLogic';
import { emoji, timeWordForms, diceRegEx } from './constants';
import { helloMarkup, dicesMarkup } from './keyboards';
import { getWordForm, getMention } from './utils';


export default function (bot: Bot) {

  //   bot.hears(/^\/(r|roll|help|start)$/i, (c) => c.reply(`Готова помочь, ${getMention(c)}!`, { parse_mode: "HTML", reply_markup: helloMarkup }));

  //   bot.hears(/^\/(r|roll)\s+(.+)/i, async (c) => {
  //   const text = c.match[2];

  //   const rolls = [...text.matchAll(diceRegEx)]
  //     .map(m => disassembleMatch(m))
  //     .filter((roll): roll is [number, number, number] => roll !== null);

  //   await sendFormattedAnswer(c, doRolls(rolls));
  // });

  bot.command(["r", "roll"], async (ctx) => {
    const text = ctx.match?.trim();
    if (!text) {
      await ctx.reply(`Готова помочь, ${getMention(ctx)}!`, {
        parse_mode: "HTML",
        reply_markup: helloMarkup
      });
    } else {
      const rolls = [...text.matchAll(diceRegEx)]
        .map(m => disassembleMatch(m))
        .filter((roll): roll is [number, number, number] => roll !== null);

      await sendFormattedAnswer(ctx, doRolls(rolls));
    }
  });

  bot.inlineQuery(diceRegEx, async (ctx) => {
    const query = ctx.inlineQuery.query.trim();
    const rolls = [...query.matchAll(diceRegEx)]
      .map(m => disassembleMatch(m))
      .filter((roll): roll is [number, number, number] => roll !== null);

    const rollsText = rolls.map(r => `${r[0]}d${r[1]}${r[2] > 0 ? `h${r[2]}` : r[2] < 0 ? `l${-r[2]}` : ''}`).join(', ');
    await ctx.answerInlineQuery([
      {
        type: "article",
        id: "0",
        title: `Результат броска`,
        input_message_content: { message_text: `Результат броска <pre>${query}</pre>\n ${rollsText}`, parse_mode: "HTML" },
      },
    ]);
  });


  bot.on("callback_query:data", async (c) => {
    const data = c.callbackQuery.data;
    const match = data.match(diceRegEx);
    if (match) {
      await c.editMessageReplyMarkup({ reply_markup: undefined });
      await sendFormattedAnswer(c, doRolls([disassembleMatch(match)!]), false, dicesMarkup);
    } else if (data === 'dice') {
      await c.editMessageReplyMarkup({ reply_markup: dicesMarkup });
    } else if (data === 'attr') {
      await c.editMessageReplyMarkup({ reply_markup: undefined });
      await sendFormattedAnswer(c, doRolls(Array(6).fill([4, 6, 3])), true);
    }
    await c.answerCallbackQuery();
  });

  return bot;
}


async function sendFormattedAnswer(ctx: Context, rollsData: RollResult[][], withEmoji = false, keyboard?: InlineKeyboard) {
  const flatResults = rollsData.flat();
  if (flatResults.length === 0) return;
  const maxLen = Math.max(...flatResults.map(r => r.outSum.length));

  let text = `🎲 ${getMention(ctx)} rolled${rollsData.length > 1 || rollsData[0].length > 1 ? '\n' : ' '}`;
  for (const row of rollsData) {
    text += (row.length > 1 ? `${row.length} ${getWordForm(row.length, timeWordForms)} по «${row[0].outAction}»:\n` : `${row[0].outAction}: `);
    for (const line of row) {
      text += `<code>${line.outSum.padStart(maxLen, ' ')}</code>${withEmoji ? (emoji[Math.floor(line.sum / 2)] || '') : ''} ${line.outDice}\n`;
    }
  }
  await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
}
