const ytdl = require('ytdl-core-discord');
const envutils = require('../../envutils.js');
const utils = require('../../utils.js');
// TODO eventually should be defined inside its own subdirectory
const REL_PATH_INTERMISSION_SND_DIR = 'sound/';
// TODO this just loops the input for now so this is for holding it
// eventually this should grab things from the database instead
let ogurl;
// TODO eventually a broadcast should be used instead for perf
const INTERMISSIONS = [
  'todd.ogg', 'think.ogg'
];
const BASE_INTER_CHANCE = 20;

module.exports = {
  name: 'start',
  aliases: ['on', 'begin'],
  cd: 11,
  desc: 'Tune in and listen',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    // TODO eventually, this should be removed
    if (!args.length) {
      return msg.reply('Need a source YouTube url to play from');
    }
    if (!ytdl.validateURL(args[0])) {
      return msg.reply(`${args[0]} does not look like a valid YouTube url`);
    }

    // TODO for now just replays the input url but should be randomizing from DB
    let ytplay = new AudioInfo(
      args[0],
      true
    );
    ogurl = args[0];

    if (connectionCore.getConnection(msg.client)) {
      play(msg, connectionCore.getConnection(msg.client), ytplay);
    } else {
      msg.member.voice.channel.join()
        .then(connection => {
          // set a listener to remove the cached connection
          connection.on('disconnect', () => {
            if (envutils.useDetailedLogging()) {
              console.log('Radio disconnected fully');
            }
            connectionCore.resetConnection(msg.client);
          });
          play(msg, connection, ytplay);
          connectionCore.setConnection(msg.client, connection);
        })
        .catch(err => {
          msg.reply('Something went wrong while joining voice. Try again later');
          console.error(`Error joining voice: ${err}`);
        })
    }
  }
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

// TODO this logic should eventually belong only to the VoiceBroadcast instance
// and this module should be converted to just add subscribers
/**
 * Play the currently given audio on the given connection, then
 * decide what to play next
 * 
 * @param {Discord.Message} msg original msg requesting this action
 * @param {Discord.StreamDispatcher} connection connection to play on
 * @param {AudioInfo} audioinfoobj object containing info on what to play
 * @param {Number} interchance chance to play an intermission afterward
 */
async function play(msg, connection, audioinfoobj, interchance = BASE_INTER_CHANCE) {
  if (envutils.useDetailedLogging()) {
    console.log(`Intermission chance is at ${interchance}`);
  }

  const dispatch = audioinfoobj.isYtUrl
    ? connection.play(
      await ytdl(audioinfoobj.name, { filter: 'audioonly' }),
      {
        type: 'opus',
        volume: 0.35
      }
    )
    : connection.play(
      audioinfoobj.name,
      { 
        volume: 0.8 
      }
    )
    ;

  dispatch.on('start', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`Radio playing ${audioinfoobj.name}`);
    }
  });
  dispatch.on('error', (err) => {
    msg.reply(`There was an error playing ${audioinfoobj.name}. Yell at Dev!`);
    console.error(`Error while playing ${audioinfoobj.name}: ${err}`);
    connection.disconnect();
  });
  dispatch.on('finish', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`Changing off of ${audioinfoobj.name} now`);
    }

    // with a certain chance, play an 'intermission' afterward instead
    if (utils.withChance(interchance)) {
      // construct the sound path based on the names
      let intermission = utils.pickRandomly(INTERMISSIONS);
      let sndplay = new AudioInfo(
        REL_PATH_INTERMISSION_SND_DIR + intermission,
        false
      );
      play(msg, connection, sndplay);
    } else {
      // TODO for now just replays the original input url but should be randomizing from DB
      let ytplay = new AudioInfo(
        ogurl,
        true
      );
      play(msg, connection, ytplay, interchance + 20);
    }
  });
}
