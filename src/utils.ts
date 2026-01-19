import { Context } from "grammy";


export const getMention = (ctx: Context): string => {
  const from = ctx.from;
  if (!from) return "Unknown";
  return from.username
    ? `@${from.username}`
    : `<a href="tg://user?id=${from.id}">${from.first_name}</a>`;
};

export function getWordForm(num: number, forms: string[]): string {
  const hundred = Math.abs(num) % 100;
  if (hundred > 10 && hundred < 20) return forms[2];
  const unit = hundred % 10;
  if (unit > 1 && unit < 5) return forms[1];
  return unit === 1 ? forms[0] : forms[1];
}