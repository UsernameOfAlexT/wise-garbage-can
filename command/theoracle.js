const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const { oracle_defaults_array } = require('../defaultlists.json');
const { MessageEmbed } = require('discord.js');
const utils = require('../utils.js')
const OPT_ARGS = 'options'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('theoracle')
    .setDescription('Figure out what to do with your life by letting me choose from a list')
    .addStringOption(option =>
      option.setName(OPT_ARGS)
        .setDescription('Optional sequence to choose from.\n'
          + 'Separate options using \"|\" i.e.: [option1]|[option2]|[option3] ...')),
  cd: 3,
  disallowDm: false,
  needSendPerm: true,
  execute(interaction) {
    const args = interaction.options.getString(OPT_ARGS);
    let reply;
    let choices;

    if (!args) {
      choices = oracle_defaults_array;
      reply = "The oracle shall use the tablet of the ancients";
    } else {
      choices = args.split('|');
      reply = `The oracle considers your query: ${args}`;
    }

    new InteractionReply(interaction)
        .withReplyContent(reply)
        .withEmbedContent([getEmbed(choices)])
        .withHidden(false)
        .replyTo();
  }
}

/**
 * Get an embed to be used as a response based on the given info
 */
function getEmbed(choices) {
  return new MessageEmbed()
    .setTitle('The oracle has spoken:')
    .setDescription(`The chosen one is: ${utils.pickRandomly(choices)}`)
    ;
}