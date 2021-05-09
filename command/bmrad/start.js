const FLAG_SILENT = '-silent';

module.exports = {
  name: 'start',
  aliases: ['on', 'begin'],
  cd: 11,
  desc: 'Tune in and listen',
  disallowDm: true,
  vcRequired: true,
  usage: `[${FLAG_SILENT} : when included, disables most info from being posted]`,
  execute(msg, args, connectionCore) {
    // do not join guilds where this is already active to
    // prevent some nasty behaviours
    if (guildHasSubscription(msg, connectionCore.getBroadcast(msg.client, false))) {
      return msg.reply('Cannot be playing twice in the same server. Stop the first one');
    }

    msg.member.voice.channel.join()
      .then(connection => {
        // subscribe to the broadcast
        // this connection still needs to be dc'd elsewhere (in stop)
        const dispatch = connection.play(connectionCore.getBroadcast(msg.client));
        const subbedChannel = args.includes(FLAG_SILENT)
          ? undefined
          : msg.channel
          ;
        connectionCore.addToSubscribed(dispatch, subbedChannel);
      })
      .catch(err => {
        msg.reply('Something went wrong while joining voice. Try again later');
        console.error(`Error joining voice: ${err}`);
      })
  }
}

/**
 * Return whether the requesting guild already has a subscribed voice channel
 * 
 * @param {Discord.Message} msg 
 * @param {Discord.VoiceBroadcast} broadcast 
 * @returns whether guild has a subscription
 */
function guildHasSubscription(msg, broadcast) {
  return (broadcast && broadcast.subscribers)
    ? isGuildSubscribed(msg.member.voice.guild.id, broadcast.subscribers)
    : false;
}

/**
 * Get whether this guild has a subscription
 * 
 * @param {Snowflake} guildId 
 * @param {Array<Discord.StreamDispatcher>} subscribers 
 */
function isGuildSubscribed(guildId, subscribers) {
  return subscribers.some(
    subscriber =>
      subscriber.player.voiceConnection.channel.guild.id === guildId
  )
}
