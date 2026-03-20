import { InlineKeyboard } from 'grammy';

export const helloMarkup = new InlineKeyboard()
.text('Куб', 'dice').primary()
.text('Статы', 'attr').success();
export const dicesMarkup = new InlineKeyboard()
	.text('d100', 'd100').text('d4', 'd4').text('d20', 'd20').row()
	.text('d6', 'd6').text('d8', 'd8').text('d10', 'd10').text('d12', 'd12');