const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const {oracle_defaults_array} = require('../defaultlists.json');
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
    let choices = oracle_defaults_array;
    const args = interaction.options.getString(OPT_ARGS);

    if (!args) {
      new InteractionReply(interaction)
        .withReplyContent("The oracle shall use the list that has existed since time\'s dawn")
        .withHidden(false)
        .replyTo();
    } else {
      new InteractionReply(interaction)
        .withReplyContent("The oracle considers your query")
        .withHidden(false)
        .replyTo();
      choices = args.split('|');
    }

    new InteractionReply(interaction)
        .withReplyContent(`The ancient oracle speaks! \n${utils.pickRandomly(choices)}`)
        .withHidden(false)
        .replyTo();
  }
}