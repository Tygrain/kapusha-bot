import { getWordForm } from './utils.js';
import { sidesWordForms } from './constants.js';

export interface RollResult {
	sum: number;
	outAction: string;
	outDice: string;
	outSum: string;
}


export function disassembleMatch(match: RegExpMatchArray | null): [number, number, number] | null {
  if (!match) return null;
  let [, dicesStr, sidesStr, highOrLow, extremumsStr] = match;
  let dices = Math.min(parseInt(dicesStr || "1"), 100);
  let sides = Math.min(parseInt(sidesStr || "6"), 100);
  let extremums = 0;
  if (highOrLow) {
    extremums = Math.min(parseInt(extremumsStr || "1"), 99);
    if (highOrLow === 'l') extremums *= -1;
  }
  return [dices, sides, extremums];
}

export function doRoll(dices: number, sides: number, extremums: number): RollResult {
  const values = Array.from({ length: dices }, () => 1 + Math.floor(Math.random() * sides));
  let result = [...values];
  let extremumAdjective = "";

  if (extremums > 0) {
    result.sort((a, b) => b - a);
    extremumAdjective = `, с ${extremums} наибольш.`;
  } else if (extremums < 0) {
    result.sort((a, b) => a - b);
    extremumAdjective = `, с ${Math.abs(extremums)} наименьш.`;
  }
  if (extremums !== 0 && Math.abs(extremums) < result.length) result.length = Math.abs(extremums);

  const sum = result.reduce((acc, num) => acc + num, 0);
  const outAction = `${dices > 1 ? dices + ' ' : ''}${sides}${getWordForm(dices, sidesWordForms)}${extremumAdjective}`;
  const outDice = values.length > 1 ? ` (${values}${result.length !== values.length && result.length > 1 ? ` = ${result}` : ""})` : "";

  return { sum, outAction, outDice, outSum: sum.toString() };
}

export function doRolls(rolls: any[][]): RollResult[][] {
  const results: RollResult[][] = [];
  let lastSetup: (number | null)[] = [null, null, null];

  for (const roll of rolls) {
    if (roll.length < 2) {
      results.push([{ outSum: '', outAction: `💢ошибка в: <code>${roll}</code>`, sum: 0, outDice: '' }]);
      lastSetup = [null, null, null]; continue;
    }
    if (roll[0] !== lastSetup[0] || roll[1] !== lastSetup[1] || roll[2] !== lastSetup[2]) {
      lastSetup = [roll[0], roll[1], roll[2]];
      results.push([]);
    }
    results[results.length - 1].push(doRoll(roll[0], roll[1], roll[2]));
  }
  return results;
}