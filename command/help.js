const prefix = process.env.CMD_PREFIX;
const utils = require('../utils.js');

module.exports = {
  name: 'help',
  aliases: ['h', 'man'],
  cd: 5,
  desc: 'You already are using this thing. Quit asking',
  disallowDm: false,
  needSendPerm: true,
  cleanupRequest: true,
  usage: '[command name]',
  execute(msg, args) {
    const msgToBuild = [];
    const { commands } = msg.client;
    if (!args.length) {
      msgToBuild.push('These are my commands:');
      msgToBuild.push(commands.map(command => command.name).join(', '));
      msgToBuild.push(`\n \'${prefix}help [command name]\' will get you detailed info`);
      // This is unlikely to exceed 2000 characters, but if it does it will
      // need to be manually split to prevent truncation
      msg.author.send(msgToBuild.join('\n'))
        .then(() => {
          if (!(msg.channel.type === 'DM')) {
            utils.safeMention(msg, 'Check your DMs for my commands');
          }
        })
        .catch(err => {
          console.error(`${msg.author.tag} failed to DM with help info. \n`, err);
          utils.safeMention(msg, 'I was going to DM you with my commands, but I couldn\'t');
        })
    } else {
      const cmdName = args[0].toLowerCase();
      const command = commands.get(cmdName)
        || commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

      if(!command) {
        return utils.safeMention(msg, 'That isn\'t anything I recognize.'
         + '\nCome up with better fake names, are you even trying?');
      }

      msgToBuild.push(` |- Command Name -| : ${command.name}`);
      if (command.aliases) {
        msgToBuild.push(`|- Aliases -| : ${command.aliases.join(', ')}`);
      }
      if (command.desc) {
        msgToBuild.push(` |- Command Description -| : ${command.desc}`);
      }
      if (command.usage) {
        msgToBuild.push(` |- Command Usage -| : ${prefix}${command.name} ${command.usage}`);
      }
      msgToBuild.push(` |- Cooldown -| : ${command.cd || 3} second(s)`);

      msg.channel.send(msgToBuild.join('\n'));
    }
  }
}
