const utils = require('../../utils.js');
const Discord = require('discord.js');
// silly random descriptions to throw when skipping
const CANNED_DESC_PHRASES = [
  "Ooooh don't want it",
  "Just say no",
  "Yeah, I didn't like that one either",
  "Skip-rope",
  "Hop, Skip, Jump"
];

module.exports = {
  name: 'skip',
  aliases: ['next'],
  cd: 11,
  desc: 'Skip over the currently playing track',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    // TODO shared with stop. consider making common
    let subscribedStream;
    let activeBroadcast = connectionCore.getBroadcast(msg.client, false);
    if (activeBroadcast) {
      subscribedStream = getMemberChannelStream(
        msg,
        activeBroadcast
      );
    }

    if (!subscribedStream) {
      return msg.reply('Your voice channel does not seem to have anything to skip');
    }
    // broadcast known to exist at this point
    if (!activeBroadcast.dispatcher) {
      return msg.reply('Nothing seems to be playing. Try again later');
    }

    // flushes remaining data and emits the finish event
    activeBroadcast.dispatcher.end(() => {
      return msg.channel.send(new Discord.MessageEmbed()
        .setTitle("Skipped!")
        .setDescription(utils.pickRandomly(CANNED_DESC_PHRASES)));
    });
  }
}

// TODO also shared with stop. consider making common
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
