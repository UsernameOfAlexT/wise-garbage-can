const vcsfxsupp = require('./vcsfxsupport/vcsfxsupp.js');
const utils = require('../utils.js');
// NOTE: this seems to need to be relative to index, and not this module
const REL_PATH_TO_SOUND_DIR = 'sound/';
/**
 * Static Audio files stored locally for now.
 * Not a huge mission critical app so S3 and stuff is kinda overkill
 */
// it is preferable to have all audio as Ogg/WebM for performance

module.exports = {
  name: 'vcsfx',
  aliases: ['vsfx', 'vcfx'],
  cd: 6,
  desc: 'Play some sounds in the voice channel you are in. Very annoying!',
  disallowDm: true,
  needSendPerm: true,
  usage: '{optional tag}',
  execute(msg, args) {
    if (!msg.channel.guild.available) { return; }

    if (!msg.member.voice.channel) {
      return msg.reply(
        'That\'s a totally non-existent voice channel you\'re in. ' +
        'Join a real one and we\'ll talk.'
      );
    }

    // decide what ought to be played
    // TODO implement deciding based on passed tag arg
    const fileToPlay = !args.length ? randomSfx() : 'CURRENTLY NOT IMPLEMENTED';
    // TODO use fs to check validity
    // TODO check what happens when two things try to play at once
    msg.member.voice.channel.join()
    .then(connection => {
      // NOTE: if the file[path] is invalid then this just finishes immediately
      const dispatch = connection.play(fileToPlay, { volume: 0.8});
      dispatch.on('start', () => {
          console.log(`I should be playing ${fileToPlay} now`);
      });
      dispatch.on('error', () => {
        msg.reply('We had some trouble playing that one. Try again later.');
        console.err(`Error while playing ${fileToPlay}`);
        connection.disconnect();
      });
      dispatch.on('finish', () => {
        console.log(`I should be done playing ${fileToPlay} now`);
        connection.disconnect();
      });
    })
    .catch(err => {
        msg.reply('Could not join voice. Something might have gone wrong');
        console.err(`Error joining voice: ${err}`);
    });
    
  }
}

function randomSfx() {
  return buildPathToSound(utils.pickRandomly(vcsfxsupp.sfxsupp));
}

function buildPathToSound(sfxsuppobj) {
  if (!sfxsuppobj.name) {
    console.err('Tried to build path to audio file but no name provided!');
    return;
  }
  return REL_PATH_TO_SOUND_DIR + sfxsuppobj.name;
}
