const fs = require('fs');
const Discord = require('discord.js');
// this one is relative to the top level caller
const PATH_TO_SUBMODULES = './command/bmrad';
// this one is for use within the module so it should be relative to this file
const REL_PATH_TO_SUBMODULES = './bmrad';

const bmradsub = new Discord.Collection();
mapCommands(bmradsub);

module.exports = {
  name: 'bmrad',
  aliases: ['bmradio'],
  cd: 11,
  desc: 'Mysterious noises: radio style',
  disallowDm: false,
  needSendPerm: true,
  cleanupRequest: true,
  usage: '[submodule commands] [arguments]',
  execute(msg, args) {
    if (!args.length) {
      return msg.reply('Type \'bmrad help\' for usage notes');
    }

    // handle info special cases
    if (args[0].toLowerCase() === 'help') {
      const msgToBuild = [];
      msgToBuild.push('Usage: use one of the below when invoking');
      msgToBuild.push(bmradsub.map(cmd =>
        `${cmd.name} : ${cmd.desc} \n || Usage: ${cmd.name} ${cmd.usage} ||`
      ).join('\n'));

      return msg.author.send(msgToBuild, { split: true })
        .then(() => {
          if (!(msg.channel.type === 'dm')) {
            msg.reply('Check your DMs for usage help');
          }
        })
        .catch(err => {
          console.error(`${msg.author.tag} failed to DM with help info. \n`, err);
          msg.reply('I was going to DM you with usage help, but I couldn\'t');
        })
    }

    // arg parser, same as in base
    const subcommandname = args.shift().toLowerCase();

    // do we actually have this command?
    const subcmd = bmradsub.get(subcommandname);
    if (!subcmd) {
      return msg.reply(`${subcommandname} is not a recognized command`);
    }

    if (subcmd.disallowDm && msg.channel.type === 'dm') {
      return msg.reply(`${subcommandname} cannot be used from a DM`);
    }

    if (subcmd.vcRequired && !msg.member.voice.channel) {
      return msg.reply(`You need to join a voice channel for ${subcommandname} to work`);
    }
    // TODO cd checker for just the submodules?

    try {
      subcmd.execute(msg, args);
    } catch (err) {
      console.error(err);
      msg.reply(`Something went wrong within ${subcommandname}`);
    }
  }
}

// same logic used to fetch top level modules TODO possibly make this common
function mapCommands(command_collection) {
  const commandFiles = fs.readdirSync(PATH_TO_SUBMODULES).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`${REL_PATH_TO_SUBMODULES}/${file}`);
    command_collection.set(command.name, command);
  }
}
