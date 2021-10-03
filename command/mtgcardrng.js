const mtg = require('mtgsdk');
const utils = require('../utils.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const MAX_CARD_PAGESIZE = 10;
const DEFAULT_CARD_PAGESIZE = 1;
// try to exclude very exotic layouts as they display poorly
const RELEVANT_LAYOUTS = "normal|split|flip|double-faced|aftermath";
const CARDNO_ARG = 'number';
/** 
 * Using magicthegathering.io's api endpoints.
 * Ratelimited to 5000/hr but we really shouldn't be coming anywhere remotely close
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mtgrng')
    .setDescription('Grab a number of random MTG card(s) and show them')
    .addIntegerOption(option =>
      option.setName(CARDNO_ARG)
        .setDescription('Optional number of cards to fetch (default 1)')),
  cd: 30,
  disallowDm: false,
  needSendPerm: true,
  execute(interaction) {
    if (!(msg.channel.type === 'GUILD_TEXT' || msg.channel.type === 'DM')) {
      return utils.safeReply(msg, 'This needs to be used from text channels or DMs');
    }

    premsgToBuild = [];
    premsgToBuild.push('I have heard your request. Allow me some time to consult the elders');
    let pageSizeParsed = parseNumberArg(args, premsgToBuild);

    msg.channel.send(premsgToBuild.join('\n'));
    /** 
     * note: I would like to use contains to filter out image-less results but it
     *  doesn't seem to behave when used with random
    */
    mtg.card.where({
      page: 1,
      pageSize: pageSizeParsed,
      random: true,
      layout: RELEVANT_LAYOUTS,
    })
      .then(cards => {
        if (!cards.length) {
          console.error('No cards were returned by the query');
          return msg.channel.send('Something strange happened. Try again later');
        }

        resmsgToBuild = [];
        resmsgToBuild.push(`Behold the glory of ${pageSizeParsed} randomly chosen card(s)`)
        for (const card of cards) {
          addCardInfo(resmsgToBuild, card);
        }

        msg.channel.send(resmsgToBuild.join('\n'))
          .catch(err => {
            msg.channel.send('We had trouble figuring the card(s) out. Try again later');
            console.error('Display issues. \n', err);
          });
      })
      .catch(err => {
        msg.channel.send('Seems like something went wrong while getting cards. Try again later');
        console.error(`Something went wrong while using the mtg api. \n`, err);
      });
  }
}

function addCardInfo(msgBuildArr, card) {
  const cardName = card.name || "An Unknown Card";
  const cardSet = card.setName || "An Unknown Set";
  const cardText = card.text || "Oh, I couldn't find that either. This must be a nonstandard card."
  const cardImgUrl = card.imageUrl || `I couldn't find an image for this card, so here is its text:\n ${cardText}`;
  msgBuildArr.push(`Check out ${cardName} from ${cardSet}\n${cardImgUrl}\n`)
}

/**
 * 
 * @param {*} args list of provided args
 * @param {*} msgBuildArr array of messages to add on our response to if something happens
 */
function parseNumberArg(args, msgBuildArr) {
  // try our best to parse the first argument to a number if it seems to be specified
  if (args[0]) {
    const parsedValue = parseInt(args[0], 10);
    if (isNaN(parsedValue) || parsedValue > MAX_CARD_PAGESIZE) {
      msgBuildArr.push(`Fetching default number: ${DEFAULT_CARD_PAGESIZE}`);
      msgBuildArr.push(`Number was either invalid or greater than the max allowed of ${MAX_CARD_PAGESIZE}`);
      return DEFAULT_CARD_PAGESIZE;
    }
    return parsedValue;
  }

  return DEFAULT_CARD_PAGESIZE;
}