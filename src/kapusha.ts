import { Bot, InlineKeyboard, Context } from 'grammy';
import { disassembleMatch, doRolls, type RollResult } from './diceLogic';
import { emoji, timeWordForms, diceRegEx } from './constants';
import { helloMarkup, dicesMarkup } from './keyboards';
import { getWordForm, getMention } from './utils';


export function setup(bot: Bot) {
  bot.hears(/^\/(r|roll|help|start)$/, (c) => c.reply(`Готова помочь, ${getMention(c)}!`, { parse_mode: "HTML", reply_markup: helloMarkup }));

  bot.hears(/^\/(r|roll) (.+)/, async (c) => {
    const rolls = c.match[2].trim().split(/\s+/).filter(i => i !== "/r").map(item => disassembleMatch(item.match(diceRegEx)) ?? [item]);
    await sendFormattedAnswer(c, doRolls(rolls));
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
