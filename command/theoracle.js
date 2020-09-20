const {oracle_defaults_array} = require('../defaultlists.json');
const utils = require('../utils.js')

module.exports = {
  name: 'theoracle',
  aliases: ['oracle'],
  cd: 3,
  desc: 'Figure out what to do with your life by letting me choose from a list',
  disallowDm: false,
  usage: '[option1] [option2] ...',
  execute(msg, args) {
    let choices = oracle_defaults_array;

    if (!args.length) {
      msg.channel.send("The oracle shall use the list that has existed since time\'s dawn");
    } else {
      msg.channel.send("The oracle considers your query");
      choices = args;
    }

    msg.reply("The ancient oracle speaks! \n" + oraclePicker(choices));
  }
}

function oraclePicker(choices) {
  let choseni = utils.randomInt(choices.length);
  let subject = utils.pickSafely(choseni, choices);
  return subject;
}