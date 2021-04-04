module.exports = {
  name: 'stop',
  aliases: ['off'],
  cd: 11,
  desc: 'Tune out and return to reality',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    let subscribedStream;
    let activeBroadcast = connectionCore.getBroadcast(msg.client, false);
    if (activeBroadcast) {
      subscribedStream = getMemberChannelStream(
        msg,
        activeBroadcast
      );
    }

    if (!subscribedStream) {
      return msg.reply('There doesn\'t seem to be anything to stop in your voice channel');
    }

    subscribedStream.player.voiceConnection.disconnect();
    subscribedStream.destroy();
  }
}

/**
 * Get the stream dispatcher of the voice channel that the
 * sender of the message is in that is subscribed to the
 * given broadcast
 * 
 * @param {Discord.Message} msg 
 * @param {Discord.VoiceBroadcast} broadcast 
 * @returns matching dispatcher if found else undefined 
 */
function getMemberChannelStream(msg, broadcast) {
  return broadcast.subscribers
    ? getSubscribedStream(msg.member.voice.channel, broadcast.subscribers)
    : undefined;
}

/**
 * Get the stream that is currently playing in the given
 * voice channel from the given list. Undefined if not found
 * 
 * @param {Discord.VoiceChannel} voiceChannel 
 * @param {Array<Discord.StreamDispatcher>} subscribers 
 */
function getSubscribedStream(voiceChannel, subscribers) {
  return subscribers.find(
    subscriber =>
      subscriber.player.voiceConnection.channel.id === voiceChannel.id
  )
}
