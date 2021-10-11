const utils = require('../utils.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const CMD_ARG = 'command';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get some quick info on offered commands')
    .addStringOption(option =>
      option.setName(CMD_ARG)
        .setDescription('Optional name of command to get info on')),
  cd: 5,
  disallowDm: false,
  needSendPerm: false,
  execute(interaction) {
    const msgToBuild = [];
    const { commands } = interaction.client;
    const cmdarg = interaction.options.getString(CMD_ARG);
    if (!cmdarg) {
      msgToBuild.push('These are my commands:');
      msgToBuild.push(commands.map(command => command.data.name).join(', '));
      msgToBuild.push(`\n \'/help [command name]\' will get you detailed info`);
      // This is unlikely to exceed 2000 characters, but if it does it will
      // need to be manually split to prevent truncation
      return utils.safeReply(interaction, msgToBuild.join('\n'));
    }

    const command = commands.get(cmdarg);
    if (!command) {
      return utils.safeReply(interaction, 'That isn\'t anything I recognize.'
        + '\nCome up with better fake names, are you even trying?');
    }

    msgToBuild.push(` |- Command Name -| : ${command.data.name}`);
    if (command.data.description) {
      msgToBuild.push(` |- Command Description -| : ${command.data.description}`);
    }
    if (command.data.options && command.data.options.length) {
      msgToBuild.push(` |- Command Options -| : `);
      addOptionsData(msgToBuild, command.data.options);
    }
    msgToBuild.push(` |- Cooldown -| : ${command.cd || 3} second(s)`);

    utils.safeReply(interaction, msgToBuild.join('\n'));
  }
}

/**
 * Append the options to the given string array in a readable way
 * 
 * @param {String[]} msgToBuild 
 * @param {ToAPIApplicationCommandOptions} options 
 */
function addOptionsData(msgToBuild, options) {
  options.forEach(option => {
    // guard against this just in case
    if (option.name && option.description)
      msgToBuild.push(` * ${option.name}: ${option.description}`);
  });
}
