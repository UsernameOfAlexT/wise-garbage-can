const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { InteractionReply } = require('../support/intereply.js');
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
      return new InteractionReply(interaction)
        .withReplyContent(msgToBuild.join('\n')).replyTo();
    }

    const command = commands.get(cmdarg);
    if (!command) {
      return new InteractionReply(interaction)
        .withReplyContent('That isn\'t anything I recognize.'
          + '\nCome up with better fake names, are you even trying?').replyTo();
    }

    let commandInfo = new Map();
    if (command.data.description) {
      commandInfo.set(`Command Description`, `${command.data.description}`);
    }
    if (command.data.options && command.data.options.length) {
      addOptionsData(commandInfo, command.data.options);
    }
    commandInfo.set(`Cooldown`, `${command.cd || 3} second(s)`);

    new InteractionReply(interaction)
      .withEmbedContent([getInfoEmbed(`Help - ${command.data.name}`, commandInfo)])
      .withReplyContent(`${command.data.name}:`)
      .replyTo();
  }
}

/**
 * Get an embed representing the given information in the map
 */
 function getInfoEmbed(embedTitle, cmdmap) {
  let embed = new MessageEmbed().setTitle(embedTitle);

  cmdmap.forEach((v, k) => embed.addField(k, v));
  return embed;
}

/**
 * Break down the options given and add them to the map in a readable way
 * 
 * @param {Map} msgToBuild 
 * @param {ToAPIApplicationCommandOptions} options 
 */
function addOptionsData(cmd, options) {
  options.forEach(option => {
    // guard against this just in case
    if (option.name && option.description)
      cmd.set(` Option: ${option.name}`, ` ${option.description}`);
  });
}
