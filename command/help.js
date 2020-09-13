const prefix = process.env.CMD_PREFIX;

module.exports = {
  name: 'help',
  cd: 10,
  desc: 'You already are using this thing. Quit asking',
  disallowDm: false,
  usage: '[command name]',
  execute(msg, args) {
    const msgToBuild = [];
    const { commands } = msg.client;
    if (!args.length) {
      msgToBuild.push('These are my commands:');
      msgToBuild.push(commands.map(command => command.name).join(', '));
      msgToBuild.push(`\n \'${prefix}help [command name]\' will get you detailed info`);

      msg.author.send(msgToBuild, { split : true})
        .then(() => {
          if (!(msg.channel.type === 'dm')) {
            msg.reply('Check your DMs for my commands');
          }
        })
        .catch(err => {
          console.error(`${msg.author.tag} failed to DM with help info. \n`, err);
          msg.reply('I was going to DM you with my commands, but I couldn\'t');
        })
    } else {
      const cmdName = args[0].toLowerCase();
      // no alias support, currently
      const command = commands.get(cmdName);

      if(!command) {
        return msg.reply('That isn\'t anything I recognize.'
         + '\nCome up with better fake names, are you even trying?');
      }

      msgToBuild.push(` |- Command Name -| : ${command.name}`);
      if (command.desc) {
        msgToBuild.push(` |- Command Description -| : ${command.desc}`);
      }
      if (command.usage) {
        msgToBuild.push(` |- Command Usage -| : ${command.usage}`);
      }
      msgToBuild.push(` |- Cooldown -| : ${command.cd || 3} second(s)`);

      msg.channel.send(msgToBuild, { split : true });
    }
  }
}
