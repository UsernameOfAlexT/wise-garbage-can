const mtg = require('mtgsdk');
const MAX_CARD_PAGESIZE = 10;
const DEFAULT_CARD_PAGESIZE = 1;
/** 
 * Using magicthegathering.io's api endpoints.
 * Ratelimited to 5000/hr but we really shouldn't be coming anywhere remotely close
 */

module.exports = {
  name: 'mtgcardrng',
  aliases: ['mtgrng', 'rnmtg'],
  cd: 30,
  desc: 'Grab a number of random MTG card(s) and show them',
  disallowDm: false,
  needSendPerm: true,
  usage: '[optional; # of cards to get]',
  execute(msg, args) {
    if (!(msg.channel.type === 'text')) {
      return msg.reply('This needs to be used from text channels');
    }

    premsgToBuild = [];
    premsgToBuild.push('I have heard your request. Allow me some time to consult the elders');
    let pageSizeParsed = parseNumberArg(args, premsgToBuild);

    msg.channel.send(premsgToBuild, { split : true});
    /** 
     * note: I would like to use contains to filter out image-less results but it
     *  doesn't seem to behave when used with random
    */
    mtg.card.where({ page: 1, pageSize: pageSizeParsed, random: true })
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
        
        msg.channel.send(resmsgToBuild, { split : true})
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