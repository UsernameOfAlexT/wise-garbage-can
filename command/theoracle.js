const { SlashCommandBuilder } = require('@discordjs/builders');
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

    if (!args.length) {
      msg.channel.send("The oracle shall use the list that has existed since time\'s dawn");
    } else {
      msg.channel.send("The oracle considers your query");
      choices = args;
    }

    utils.safeReply(msg, "The ancient oracle speaks! \n" + oraclePicker(choices));
  }
}

function oraclePicker(choices) {
  let choseni = utils.randomInt(choices.length);
  let subject = utils.pickSafely(choseni, choices);
  return subject;
}