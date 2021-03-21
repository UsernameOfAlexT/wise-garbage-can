module.exports = {
  name: 'stop',
  aliases: ['off'],
  cd: 11,
  desc: 'Tune out and return to reality',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    if (!connectionCore.getConnection(msg.client)) {
      return msg.reply('There doesn\'t seem to be anything to stop');
    }

    connectionCore.getConnection(msg.client).disconnect();
  }
}