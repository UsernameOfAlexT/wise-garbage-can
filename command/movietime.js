const utils = require('../utils.js');
const phraserobj = require('../datalists/statusphraseobjs.js');
const phraser = require('../datalists/statusphraser.js');
const { first_names, last_names } = require('../datalists/rngparty.json');
const { status, origins } = require('../datalists/rngpartybackground.json');
const { opening, closing } = require('../datalists/movietimephrase.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { InteractionReply } = require('../support/intereply.js');
const { Formatters } = require('discord.js');

const STATE_ARG = 'state';
const RAND_TITLE_PARTS = 3;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movietime')
    .setDescription('Open/Close this channel for movie time')
    .addBooleanOption(option =>
      option.setName(STATE_ARG)
        .setDescription('Whether to set this channel open/close')
        .setRequired(true)
    ),
  cd: 5,
  disallowDm: true,
  ownerOnly: true,
  execute(interaction) {
    const state = interaction.options.getBoolean(STATE_ARG);

    if (!(interaction.channel.type === 'GUILD_TEXT')) {
      return new InteractionReply(interaction)
        .withReplyContent('This must be used from a standard text channel')
        .replyTo();
    }

    permissionsHandler(interaction, state);
  }
}

function permissionsHandler(interaction, boolState) {
  const targetChannel = interaction.channel;
  targetChannel.permissionOverwrites.create(targetChannel.guild.roles.everyone,
    {
      ADD_REACTIONS: boolState,
      SEND_MESSAGES: boolState
    })
    .then(() => {
      const embedAttachment = [getEmbed(boolState)];
      new InteractionReply(interaction)
        .withReplyContent(Formatters.channelMention(targetChannel.id))
        .withEmbedContent(embedAttachment)
        .withHidden(false)
        .replyTo();
    })
    .catch(() => {
      const errmsg = 'I could not update that channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.';
      new InteractionReply(interaction).withReplyContent(errmsg).replyTo();
    });
}

/**
 * Return an embed representing the given information
 */
function getEmbed(permState) {
  const randFooter = `${utils.pickRandomly(first_names)} ${utils.pickRandomly(last_names)}, `
    + `${utils.pickRandomly(status)} ${utils.pickRandomly(origins)}`;
  const title = permState ? utils.pickRandomly(opening) : utils.pickRandomly(closing);
  
  return new MessageEmbed()
    .setColor(`${permState ? '#2E05FF' : '#948484'}`)
    .setTitle(Formatters.underscore(title))
    .setDescription(`The channel ${permState ? 'is now open' : 'has closed'}`)
    .addField('\u200b', '\u200b')
    .addField(getRandomMsgTitle(), getRandomExtraStatus())
    .setFooter(`The person of the interval is: ${randFooter}`)
    ;
}

/**
 * Return some randomly constructed phrase.
 * Just to add some fun into the announcements
 */
function getRandomExtraStatus() {
  const wordcount = utils.withChance(80) ? 4 : 2;
  return phraserobj.chain(phraser.mvt_list, wordcount);
}

/**
 * Return some randomly constructed title.
 * Just to add some fun into the announcements
 */
function getRandomMsgTitle() {
  return phraserobj.chain(phraser.mvt_title_extras, RAND_TITLE_PARTS);
}
