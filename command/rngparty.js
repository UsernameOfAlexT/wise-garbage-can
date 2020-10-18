const partyConstructs = require('./rngpartysupport/rngpartyconstructs.js');
const Discord = require('discord.js');
const utils = require('../utils.js');
const EMBEDCLR = '#7f3fbf';
const MAX_ADDED_TRAITS = 4;

module.exports = {
  name: 'rngparty',
  aliases: ['rngp'],
  cd: 10,
  desc: 'Create random terrible party members. For fun.',
  disallowDm: false,
  needSendPerm: true,
  usage: '',
  execute(msg, args) {
    const fullName = pickOneFromEach(partyConstructs.full_name_constr);
    const backstory = pickOneFromEach(partyConstructs.backstory_constr);
    const partyClass = pickOneFromEach(partyConstructs.partyclass_constr);
    // TODO full trait addition system
    const traitlist = utils.choose(["garbledina", "gargleman", "basketball", "fsack"], 3); 
    const testEmbed = new Discord.MessageEmbed()
      .setColor(EMBEDCLR)
      .setTitle(fullName)
      .setDescription(backstory)
      .addFields(
        { name: 'Class', value: partyClass },
        { name: 'Traits', value: traitlist }
      );
    msg.reply(testEmbed);
  }
}

/**
 * Accept an array of objects and picks one item from the content of each in order,
 * returning the result as a space separated string.
 * 
 * Objects should have the fields:
 * 
 * content - string array of choices to use
 * 
 * chance - number indicating the probability that it will be included
 */
function pickOneFromEach(allChoices) {
  const choiceString = [];
  for (const choice of allChoices) {
    if (utils.withChance(choice.chance)) {
      choiceString.push(utils.pickRandomly(choice.content));
    }
  }
  return choiceString.join(' ');
}