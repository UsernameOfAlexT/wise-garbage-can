const { pickRandomly: randomly, withChance } = require('../utils.js');
const phraserobj = require('../datalists/statusphraseobjs.js');
const phraser = require('../datalists/statusphraser.js');
const { first_names, last_names } = require('../datalists/rngparty.json');
const { status, origins } = require('../datalists/rngpartybackground.json');
const { opening, closing, imgUrls, openingComment, closingComment, dada } = require('../datalists/movietimephrase.json');
const { generateImage } = require('./mvtsupport/movietimecanvas.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Formatters, MessageAttachment } = require('discord.js');
const { InteractionReply } = require('../support/intereply.js');

const RAND_TITLE_PARTS = 3;
const STATE_ARG = 'state';
const STYLE_ARG = 'style';
// style args
const DEFAULT_STYLE = 'default';
const LEAN_STYLE = 'lean';
const DADA_STYLE = 'dada';
// mapping style string to function that accepts the embed and mutates it with addons
const STYLE_TO_EMBED_ADDONS_MAP = {
  [DEFAULT_STYLE]: (embed, state) => {
    const randFooter = `${randomly(first_names)} ${randomly(last_names)}, `
      + `${randomly(status)} ${randomly(origins)}`;
    embed.setDescription(state ? randomly(openingComment) : randomly(closingComment))
      .addField('\u200b', '\u200b')
      .addField(getRandomMsgTitle(), getRandomExtraStatus())
      .addField(`The mood of the ${state ? "viewing" : "remaining interval"} is:`, '\u200b')
      .setImage(randomly(imgUrls))
      .setFooter(`The person of the interval is: ${randFooter}`)
  },
  // no addons
  [LEAN_STYLE]: () => { },
  [DADA_STYLE]: async (embed) => {
    const canvas = await generateImage();
    const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'mvt-bg.png');
    embed.setAuthor(`Art by: ${randomly(first_names)} ${randomly(last_names)}`)
      .setImage('attachment://mvt-bg.png')
      .setDescription(`TITLE: ${randomly(dada.chapter)}`);
    return [attachment];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movietime')
    .setDescription('Open/Close this channel for movie time')
    .addBooleanOption(option =>
      option.setName(STATE_ARG)
        .setDescription('Whether to set this channel open/close')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName(STYLE_ARG)
        .setDescription('Affects opening/closing messages. Mostly cosmetic.')
        .addChoice("Normal Style (Complete with Pictures and Nonsense)", DEFAULT_STYLE)
        .addChoice("Minimalism (Simple and empty)", LEAN_STYLE)
        .addChoice("Avant-Garde (WHY ARE MY BONES SO SMALL)", DADA_STYLE)
    ),
  cd: 20,
  disallowDm: true,
  ownerOnly: true,
  execute(interaction) {
    if (interaction.channel.type !== 'GUILD_TEXT') {
      return new InteractionReply(interaction)
        .withReplyContent('This must be used from a standard text channel')
        .replyTo();
    }
    const { options } = interaction;
    const state = options.getBoolean(STATE_ARG);
    const style = options.getString(STYLE_ARG) || DEFAULT_STYLE;

    permissionsHandler(interaction, state, style);
  }
}

/**
 * Handle permissions change and reply
 * @param {Interaction} interaction interaction to be replied to
 * @param {Boolean} targetState target state to change add/send permissions to
 * @param {String} style determines reply handler to be used
 */
function permissionsHandler(interaction, targetState, style) {
  let files;
  const getEmbed = async () => {
    const embed = new MessageEmbed()
      .setColor(`${targetState ? '#2E05FF' : '#948484'}`)
      .setTitle(Formatters.underscore(targetState ? randomly(opening) : randomly(closing)))
      ;
    // addons based on style
    const applyEmbedStyle = STYLE_TO_EMBED_ADDONS_MAP[style];
    if (applyEmbedStyle) files = await applyEmbedStyle(embed, targetState) || [];
    return embed;
  }
  const { channel } = interaction;
  const { permissionOverwrites, guild, id: channelId } = channel;
  permissionOverwrites.create(guild.roles.everyone,
    {
      ADD_REACTIONS: targetState,
      SEND_MESSAGES: targetState
    })
    .then(async () => {
      // Future: style may be used to affect things here too
      new InteractionReply(interaction)
        .withReplyContent(Formatters.channelMention(channelId))
        .withEmbedContent([await getEmbed()]) // sets files within
        .withHidden(false)
        .withFiles(files)
        .replyTo();
    })
    .catch((err) => {
      console.log(err)
      const errmsg = 'I could not update that channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.';
      new InteractionReply(interaction).withReplyContent(errmsg).replyTo();
    });
}

/**
 * Return some randomly constructed phrase.
 * Just to add some fun into the announcements
 */
function getRandomExtraStatus() {
  const wordcount = withChance(80) ? 4 : 2;
  return phraserobj.chain(phraser.mvt_list, wordcount);
}

/**
 * Return some randomly constructed title.
 * Just to add some fun into the announcements
 */
function getRandomMsgTitle() {
  return phraserobj.chain(phraser.mvt_title_extras, RAND_TITLE_PARTS);
}
