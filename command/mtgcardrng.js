const mtg = require('../support/mtgapicust.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const { MessageEmbed } = require('discord.js');
const MAX_CARD_PAGESIZE = 10;
const DEFAULT_CARD_PAGESIZE = 1;
// try to exclude very exotic layouts as they display poorly
const RELEVANT_LAYOUTS = "normal|split|flip|transform|aftermath";
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
        .setDescription('Optional number of cards to fetch' +
          ` (default ${DEFAULT_CARD_PAGESIZE}, max ${MAX_CARD_PAGESIZE})`)
    ),
  cd: 30,
  disallowDm: false,
  needSendPerm: true,
  execute(interaction) {
    if (!(interaction.channel.type === 'GUILD_TEXT' || interaction.channel.type === 'DM')) {
      return new InteractionReply(interaction)
        .withReplyContent('This needs to be used from text channels or DMs').replyTo();
    }

    premsgToBuild = [];
    premsgToBuild.push('I have heard your request. Allow me some time to consult the elders');
    let pageSizeParsed = parseNumberArg(interaction.options, premsgToBuild);

    new InteractionReply(interaction)
      .withThen(() => fetchCards(interaction, pageSizeParsed))
      .withReplyContent(premsgToBuild.join('\n')).replyTo();
  }
}

/**
 * Fetch cards, format them in a readable way, then followup the reply with it
 * 
 * @param {Discord.Interaction} interaction interaction to use for replies/followups
 * @param {Number} pageSizeParsed Number of cards to query for
 */
function fetchCards(interaction, pageSizeParsed) {
  /** 
     * note: I would like to use contains to filter out image-less results but it
     *  doesn't seem to behave when used with random
    */
  mtg.getCards.where({
    page: 1,
    pageSize: pageSizeParsed,
    random: true,
    layout: RELEVANT_LAYOUTS,
  })
    .then(cards => {
      if (!cards.length) {
        console.error('No cards were returned by the query');
        return new InteractionReply(interaction)
          .withReplyContent('Something strange happened. Try again later').replyTo();
      }

      let embeds = [];
      for (const card of cards) {
        addCardInfo(embeds, card);
      }

      new InteractionReply(interaction)
        .withReplyContent(`Behold the glory of ${pageSizeParsed} randomly chosen card(s)`)
        .withEmbedContent(embeds)
        .withHidden(false)
        .replyTo();
    })
    .catch(err => {
      new InteractionReply(interaction)
        .withReplyContent('Seems like something went wrong while getting cards. Try again later')
        .replyTo();
      console.error(`Something went wrong while using the mtg api. \n`, err);
    });
}

function addCardInfo(embedArr, card) {
  const { 
    name: cardName = "Unknown Name",
    setName: cardSet = "Unknown Set",
    text: cardText = "No Text Found" } = card;

  const cardInfo = new MessageEmbed()
    .setTitle(cardName)
    .setDescription(`From ${cardSet}`);
  if (card.imageUrl) {
    cardInfo.setImage(card.imageUrl);
  } else {
    cardInfo.addField("I couldn't find an image for this card, so here is its text", cardText);
  }
  embedArr.push(cardInfo);
}

/**
 * Parse the options for a reasonable amount arg
 * 
 * @param {Options} options the interaction's options
 * @param {*} msgBuildArr array of messages to add on our response to if something happens
 */
function parseNumberArg(options, msgBuildArr) {
  let amtarg = options.getInteger(CARDNO_ARG);
  if (amtarg && amtarg > 0) {
    if (amtarg <= MAX_CARD_PAGESIZE) {
      return amtarg;
    }
    msgBuildArr.push(`Fetching default number: ${DEFAULT_CARD_PAGESIZE}`);
    msgBuildArr.push(`Number was greater than the max allowed of ${MAX_CARD_PAGESIZE}`);
  }

  return DEFAULT_CARD_PAGESIZE;
}