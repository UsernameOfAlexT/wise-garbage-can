const mojiballconstructs = require('./emojieightballsupport/mojiballconstructs.js');
const utils = require('../utils.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const DEFAULT_EMOJI_NO = 3;
const MAX_EMOJI_NO = 10;
const GUILD_SELECTION_CHANCE = 25;
const QUESTION_ARG = 'question';
const AMT_ARG = 'number';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji8ball')
    .setDescription('Pose a question to the emojic 8 ball')
    .addStringOption(option =>
      option.setName(QUESTION_ARG)
        .setDescription('Optional question to pose')
    )
    .addIntegerOption(option =>
      option.setName(AMT_ARG)
      .setDescription('Optional number of emoji to fetch' +
      ` (default ${DEFAULT_EMOJI_NO}, max ${MAX_EMOJI_NO})`)
    )
  ,
  cd: 5,
  disallowDm: true,
  needSendPerm: false,
  execute(interaction) {
    if (!interaction.guild.available) { return; }

    // .random() directly on the collection would also work 
    // but I want a mix of guild/unicode emoji
    let emojicache = [...interaction.guild.emojis.cache.values()];
    const targetEmojiNum = parseIntArg(interaction.options)
    const emojibody = mojibuilder(emojicache, mojiballconstructs.mojiball, targetEmojiNum);

    const question = interaction.options.getString(QUESTION_ARG);
    const response = question
      ? `The Emojic 8 ball answers "${question}" with:`
      : '';
    new InteractionReply(interaction)
      .withReplyContent(response + emojibody)
      .withHidden(false)
      .replyTo();
  }
}

/**
 * Parse the options for a reasonable amount arg
 * 
 * @param {Options} options the interaction's options 
 */
function parseIntArg(options) {
  let amtarg = options.getInteger(AMT_ARG);
  if (!amtarg || amtarg < 1) { amtarg = DEFAULT_EMOJI_NO }
  return amtarg > 10 ? MAX_EMOJI_NO : amtarg;
}

function mojibuilder(guildEmoji, unicodeEmojiChoices, emojiTarget) {
  let emojicstring = [];
  for (let i = 0; i < emojiTarget; i++) {
    const nextemoji = guildEmoji.length && utils.withChance(GUILD_SELECTION_CHANCE)
      ? utils.pickRandomly(guildEmoji)
      : utils.pickRandomly(unicodeEmojiChoices)
    emojicstring.push(nextemoji);
  }
  return emojicstring.join(' ');
}
