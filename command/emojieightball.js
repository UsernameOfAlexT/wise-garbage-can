const mojiballconstructs = require('./emojieightballsupport/mojiballconstructs.js');
const utils = require('../utils.js');
const DEFAULT_EMOJI_NO = 3;
const MAX_EMOJI_NO = 10;
const GUILD_SELECTION_CHANCE = 25;

module.exports = {
  name: 'emojieightball',
  aliases: ['mojiball', 'emoji8ball', 'e8ball'],
  cd: 5,
  desc: 'Ask the emojic 8 ball a question',
  disallowDm: true,
  needSendPerm: true,
  usage: '{optional emoji number} | {optional question}',
  execute(msg, args) {
    if (!msg.channel.guild.available) { return; }

    // .random() directly on the collection would also work 
    // but I want a mix of guild/unicode emoji
    let emojicache = msg.channel.guild.emojis.cache.array();
    const targetEmojiNum = parseArgs(msg, args);
    const emojibody = mojibuilder(emojicache, mojiballconstructs.mojiball, targetEmojiNum);

    // valid parsed arguments should be stripped at this point
    const resStr = args.length
      ? 'The Emojic 8 Ball answers \"' + args.join(' ') + '\" with:\n'
      : '';
    msg.channel.send(resStr + emojibody)
      .catch(() => {
        msg.reply('Something went wrong consulting the 8 ball');
      });
  }
}

function parseArgs(msg, args) {
  if (args.length === 1) {
    return extractResult(
      parseIntWithFeedback(msg.channel, args[0], false), args, 1);
  }

  // TODO similar logic to titheTime in tithe.js. Consider making common
  if (args[1] && args[1] === '|') {
    return extractResult(
      parseIntWithFeedback(msg.channel, args[0], true), args, 2);
  }
  return DEFAULT_EMOJI_NO;
}

function extractResult(parseInfo, args, toRemove) {
  if (parseInfo.successfulParse) {
    // cut out the parsed args if successful
    args.splice(0, toRemove);
  }
  return parseInfo.res;
}

function parseIntWithFeedback(channelToSend, toParse, giveParsingFeedback) {
  let parsedInt = parseInt(toParse, 10);
  // consider parsed 0 a fail 
  const unsuccessfulParse = isNaN(parsedInt) || parsedInt < 1;
  if (giveParsingFeedback && unsuccessfulParse) {
    channelToSend.send(`${toParse} does not look like a valid number. Defaulting to ${DEFAULT_EMOJI_NO} emoji`);
  }
  // never suppress this feedback
  if (!unsuccessfulParse && parsedInt > MAX_EMOJI_NO) {
    channelToSend.send(`${parsedInt} exceeds the max of ${MAX_EMOJI_NO} emoji, so you are only getting that many`);
    parsedInt = MAX_EMOJI_NO;
  }
  return {
    res: unsuccessfulParse ? DEFAULT_EMOJI_NO : parsedInt,
    successfulParse: !unsuccessfulParse
  };
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
