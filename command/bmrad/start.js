module.exports = {
  name: 'start',
  aliases: ['on', 'begin'],
  cd: 11,
  desc: 'Tune in and listen',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    msg.member.voice.channel.join()
      .then(connection => {
        // subscribe to the broadcast
        // this connection still needs to be dc'd elsewhere (in stop)
        connection.play(connectionCore.getBroadcast(msg.client));
      })
      .catch(err => {
        msg.reply('Something went wrong while joining voice. Try again later');
        console.error(`Error joining voice: ${err}`);
      })
  }
}
