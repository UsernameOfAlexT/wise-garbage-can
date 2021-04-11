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
  getBroadcast: getBmradBroadcast
}

const REL_PATH_INTERMISSION_SND_DIR = 'sound/bmrad/';

// Define possible 'intermissions' for the radio
const INTERMISSIONS = [
  'todd.ogg', 'think.ogg'
];
// base chance to trigger intermissions per play loop
const BASE_INTER_CHANCE = 20;

// TODO temporary play list to use until we can read from db
const MOCK_PLAYLIST = [
  'https://www.youtube.com/watch?v=3MHzNfoulwI'
];

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

    // TODO this is not playing nice when multiple starts are called
    // or when start is called from a guild that already has a subscription
    client.bmradbroadcast.on('subscribe', dispatch => {
      envutils.logDetail(`New bmrad subscriber`);
    });

    client.bmradbroadcast.on('unsubscribe', dispatch => {
      envutils.logDetail(`Unsubscribe event in bmrad`);
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

        if (envutils.useDetailedLogging()) {
          const broadcastno = client.voice.broadcasts ? client.voice.broadcasts.length : 0;
          console.log(`bmradbroadcast was destroyed. There are ${broadcastno} broadcasts`);
        }
      }
    });

    let track = utils.pickRandomly(MOCK_PLAYLIST);
    let initialTrack = new AudioInfo(
      track,
      true
    );
    playbroadcast(client.bmradbroadcast, initialTrack);
    if (envutils.useDetailedLogging()) {
      const broadcastno = client.voice.broadcasts ? client.voice.broadcasts.length : 0;
      console.log(`bmradbroadcast was initialized. There are ${broadcastno} broadcasts`);
    }
  }
  return client.bmradbroadcast;
}

/**
 * simple object to hold information for play()
 * 
 * @param {String} name name for what is being played.
 *          can be either a filepath or a full youtube url
 * @param {boolean} isYtUrl whether to treat name as a url when trying to play
 */
function AudioInfo(name, isYtUrl) {
  this.name = name;
  this.isYtUrl = isYtUrl;
}

/**
 * Begin the play loop for a broadcast
 * 
 * @param {Discord.BroadcastDispatcher} broadcast broadcast to play on
 * @param {AudioInfo} audioinfoobj object containing info on what to play
 * @param {Number} interchance chance to play an intermission afterward
 */
async function playbroadcast(broadcast, audioinfoobj, interchance = BASE_INTER_CHANCE) {
  envutils.logDetail(`Intermission chance is at ${interchance}`);

  const dispatch = audioinfoobj.isYtUrl
    ? broadcast.play(
      await ytdl(audioinfoobj.name, { filter: 'audioonly' }),
      {
        type: 'opus',
        volume: 0.35
      }
    )
    : broadcast.play(
      audioinfoobj.name,
      {
        volume: 0.8
      }
    )
    ;

  dispatch.on('start', () => {
    envutils.logDetail(`Radio playing ${audioinfoobj.name}`);
  });
  dispatch.on('error', (err) => {
    console.error(`Error while playing ${audioinfoobj.name}: ${err}`);
    broadcast.end();
  });
  dispatch.on('finish', () => {
    envutils.logDetail(`Changing off of ${audioinfoobj.name} now`);

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
      let ytplay = new AudioInfo(
        track,
        true
      );
      playbroadcast(broadcast, ytplay, interchance + 20);
    }
  });
}
