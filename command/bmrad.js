const fs = require('fs');
const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const envutils = require('../envutils.js');
const utils = require('../utils.js');
// this one is relative to the top level caller
const PATH_TO_SUBMODULES = './command/bmrad';
// this one is for use within the module so it should be relative to this file
const REL_PATH_TO_SUBMODULES = './bmrad';

const bmradsub = new Discord.Collection();
mapCommands(bmradsub);

const connectionCore = {
  getBroadcast: getBmradBroadcast,
  addToSubscribed: addToWatchingChannels,
  sendToSubscribed: sendToWatchingChannels
}

const REL_PATH_INTERMISSION_SND_DIR = 'sound/bmrad/';

// Define possible 'intermissions' for the radio
const INTERMISSIONS = [
  'egresscp.ogg', 'freemanlab.ogg', 'kleinerreport.ogg',
  'zuluadmin.ogg', 'zuluinspect.ogg'
];
// A special fallback to play in the case of an error getting a YT video
const FALLBACK_TRACK = 'broken.ogg';
// base chance to trigger intermissions per play loop
const BASE_INTER_CHANCE = 20;

// TODO temporary play list to use until we can read from db
const MOCK_PLAYLIST = [
  new AudioInfo('https://youtu.be/L4zyy_NzKww', true, 0.35, "Something"),
  new AudioInfo('https://youtu.be/b7ciXnuxjyg', true, 0.55, "That Game, JurvySkat"),
  new AudioInfo('https://youtu.be/sSkgQM9d3kc', true, 0.15, "ESM"),
  new AudioInfo('https://www.youtube.com/watch?v=3MHzNfoulwI', true, 0.35, "Ducky MoMo"),
  new AudioInfo('https://youtu.be/-UzSTJ8aiGg?t=50', true, 0.35, "lolwut"), // purposefully included to test error handling
];

// observing channels that should have info given to them
// maps dispatches to text channels
// text channel can possibly be undefined. This indicates a dispatch has opted
// out of getting text updates
const WATCHING_CHANNELS = new Map();

const EMBEDCLR = '#7f3fbf';
const ERR_EMBEDCLR = '#962b2b';
const TRACK_EMBEDCLR = '#a6a6ad';

module.exports = {
  name: 'bmrad',
  aliases: ['bmradio'],
  cd: 4,
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
    const subcmd = bmradsub.get(subcommandname)
      || bmradsub.find(cmd => cmd.aliases && cmd.aliases.includes(subcommandname));
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
      subcmd.execute(msg, args, connectionCore);
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

/**
 * Get the common Bmrad broadcast if it exists.
 * Optionally init it if it does not
 * 
 * @param {Discord.Client} client client used to check broadcast
 * @param {boolean} shouldInit whether to init the broadcast if not existing
 * @returns broadcast or undefined
 */
function getBmradBroadcast(client, shouldInit = true) {
  // used by the submodules as a common way to share and interact
  if (!client instanceof Discord.Client) {
    console.error(`Was not passed a discord client! Unexpected behaviour may follow`);
    return undefined;
  }

  // if not yet created, initialize the broadcast
  if (!client.bmradbroadcast && shouldInit) {
    // create the broadcast, kick off the play loop and set listeners
    client.bmradbroadcast = client.voice.createBroadcast();

    client.bmradbroadcast.on('subscribe', dispatch => {
      envutils.logDetail(`New bmrad subscriber`);
    });

    client.bmradbroadcast.on('unsubscribe', dispatch => {
      envutils.logDetail(`Unsubscribe event in bmrad`);
      removeFromWatchingChannels(dispatch);

      // end the broadcast if there are no more subscribers
      const bmradsubscription = client.bmradbroadcast.subscribers;
      if (!bmradsubscription || !bmradsubscription.length) {
        envutils.logDetail(`The bmrad broadcast has ended`);
        // the dispatcher needs to be destroyed first
        if (client.bmradbroadcast.dispatcher) {
          client.bmradbroadcast.dispatcher.destroy();
        }
        // completely end the broadcast
        client.bmradbroadcast.end();
        client.bmradbroadcast = undefined;
        WATCHING_CHANNELS.clear();

        if (envutils.useDetailedLogging()) {
          const broadcastno = client.voice.broadcasts ? client.voice.broadcasts.length : 0;
          console.log(`bmradbroadcast was destroyed. There are ${broadcastno} broadcasts`);
        }
      }
    });

    let initialTrack = utils.pickRandomly(MOCK_PLAYLIST);
    playbroadcast(client.bmradbroadcast, initialTrack);
    if (envutils.useDetailedLogging()) {
      const broadcastno = client.voice.broadcasts ? client.voice.broadcasts.length : 0;
      console.log(`bmradbroadcast was initialized. There are ${broadcastno} broadcasts`);
    }
  }
  return client.bmradbroadcast;
}

/**
 * Add the given to the list of watched channels to recieve updates
 * 
 * @param {Discord.StreamDispatcher} dispatch dispatch to watch for during unsubscribe
 * @param {Discord.TextChannel} channel subscribing channel
 */
function addToWatchingChannels(dispatch, channel) {
  if (channel) {
    channel.send(
      new Discord.MessageEmbed()
        .setColor(EMBEDCLR)
        .setTitle("Access Granted")
        .setDescription("This channel has been subscribed to the BMesa radio feed."
          + "\n(It will get updates on what\'s playing)")
    );
  }
  WATCHING_CHANNELS.set(dispatch, channel);
}

/**
 * Unsubscribe the channel mapped from the given dispatch
 * so it no longer gets radio updates
 * 
 * @param {Discord.StreamDispatcher} dispatch dispatch to remove matching channel of 
 */
function removeFromWatchingChannels(dispatch) {
  const channelToRemove = WATCHING_CHANNELS.get(dispatch);
  if (channelToRemove) {
    channelToRemove.send(
      new Discord.MessageEmbed()
        .setColor(EMBEDCLR)
        .setTitle("Have a very safe day.")
        .setDescription("Disconnecting from the BMesa radio network...")
    );
  }
  if (!WATCHING_CHANNELS.delete(dispatch)) {
    console.error('Failed to find a matching channel for dispatch');
  }
}

/**
 * Send the given message to all watching channels
 * 
 * @param {String} msg text to send to all watching channels
 */
function sendToWatchingChannels(msg) {
  WATCHING_CHANNELS.forEach((channel) => {
    if (channel) {
      channel.send(msg);
    }
  });
}

/**
 * Simple object to hold information for play()
 * 
 * @param {String} name name for what is being played.
 *          can be either a filepath or a full youtube url
 * @param {boolean} isYtUrl whether to treat name as a url when trying to play
 * @param {Number} volume number that decides the volume of the file
 * @param {String} display human readable name.
 */
function AudioInfo(name, isYtUrl, volume = 0.8, display = "") {
  this.name = name;
  this.isYtUrl = isYtUrl;
  this.volume = volume;
  this.display = display;
}

/**
 * Use the given broadcast to attempt to play something resolvable
 * to audio. Returns the created dispatcher
 * 
 * @param {Discord.VoiceBroadcast} broadcast broadcast to play on
 * @param {*} playable anything that is playable using a broadcast
 * @param {Number} volume  volume modifier for the sound
 * @param {Boolean} isYtUrl whether to treat playable as a YouTube url
 */
function playSingle(broadcast, playable, volume, isYtUrl) {
  const options = isYtUrl
    ? { type: 'opus', volume: volume } : { volume: volume }
  return broadcast.play(
    playable,
    options
  )
}

/**
 * Decide and play the next track on the broadcast
 * 
 * @param {Discord.VoiceBroadcast} broadcast  to play on
 * @param {*} interchance 
 */
function chooseNextTrackAndPlay(broadcast, interchance) {
  // with a certain chance, play an 'intermission' afterward instead
  if (utils.withChance(interchance)) {
    // construct the sound path based on the names
    let intermission = utils.pickRandomly(INTERMISSIONS);
    let sndplay = new AudioInfo(
      REL_PATH_INTERMISSION_SND_DIR + intermission,
      false
    );
    playbroadcast(broadcast, sndplay);
  } else {
    // TODO for now just takes from a static list but should be randomizing from DB
    let track = utils.pickRandomly(MOCK_PLAYLIST);
    playbroadcast(broadcast, track, interchance + 20);
  }
}

/**
 * Begin the play loop for a broadcast
 * 
 * @param {Discord.VoiceBroadcast} broadcast broadcast to play on
 * @param {AudioInfo} audioinfoobj object containing info on what to play
 * @param {Number} interchance chance to play an intermission afterward
 */
async function playbroadcast(broadcast, audioinfoobj, interchance = BASE_INTER_CHANCE) {
  // failsafe to prevent "zombie" playing - do not try to play on a dead broadcast
  if (!broadcast || broadcast !== broadcast.client.bmradbroadcast) {
    console.error("Prevented something from playing on inactive broadcast");
    return;
  }
  envutils.logDetail(`Intermission chance is at ${interchance}`);

  let toPlay = audioinfoobj.name;
  if (audioinfoobj.isYtUrl) {
    try {
      // if a youtube link is to be played, await and check it first
      // this configuration *should* minimize any lag/strange disconnects
      toPlay = await ytdl(audioinfoobj.name, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });
      sendToWatchingChannels(
        new Discord.MessageEmbed()
          .setColor(TRACK_EMBEDCLR)
          .setTitle(`Now Playing: ${audioinfoobj.display}`)
          .setDescription(`Source: \n${audioinfoobj.name}`)
          .setURL(`${audioinfoobj.name}`)
      );
    } catch {
      // Error feedback to subscribed channels
      sendToWatchingChannels(
        new Discord.MessageEmbed()
          .setColor(ERR_EMBEDCLR)
          .setTitle("Error Recovery")
          .setDescription(`Tried: ${audioinfoobj.name} but it seems unavailable`)
      );
      console.error(`YT video ${audioinfoobj.name} was not able to be retrieved`);
      // adjust the audio info to suit the fallback
      toPlay = REL_PATH_INTERMISSION_SND_DIR + FALLBACK_TRACK;
      audioinfoobj = new AudioInfo(
        toPlay,
        false,
        0.5
      );
    }
  }

  const dispatch = playSingle(
    broadcast,
    toPlay,
    audioinfoobj.volume,
    audioinfoobj.isYtUrl
  );
  dispatch.on('error', (err) => {
    console.error(`Error while playing ${audioinfoobj.name}: ${err}`);
    sendToWatchingChannels(
      new Discord.MessageEmbed()
        .setColor(ERR_EMBEDCLR)
        .setTitle("Something went wrong!")
        .setDescription("Attempting to skip ahead to another track...")
    );

    // only the dispatch messed up, we may be able to still recover
    chooseNextTrackAndPlay(broadcast, interchance);
  });
  dispatch.on('finish', () => {
    envutils.logDetail(`Changing off of ${audioinfoobj.name} now`);
    chooseNextTrackAndPlay(broadcast, interchance);
  });
}
