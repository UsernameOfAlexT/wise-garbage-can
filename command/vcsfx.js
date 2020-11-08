const vcsfxsupp = require('./vcsfxsupport/vcsfxsupp.js');
const utils = require('../utils.js');
const fs = require('fs');
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
  desc: 'Play some random sounds in the voice channel you are in. Very annoying! ' 
  + 'Use \'vcsfx tags\' to see tag options to filter',
  disallowDm: true,
  needSendPerm: true,
  usage: '{optional tags}',
  execute(msg, args) {
    if (args[0] && args[0].toLowerCase() === 'tags') {
      const msgToBuild = [];
      vcsfxsupp.tags.forEach((val, key) => {
        msgToBuild.push(`Tag: ${val.tagname} | Description: ${val.desc}`);
      });
      return msg.author.send(msgToBuild, { split : true});
    }

    if (!msg.channel.guild.available) { return; }

    if (!msg.member.voice.channel) {
      return msg.reply(
        'That\'s a totally non-existent voice channel you\'re in. ' +
        'Join a real one and we\'ll talk.'
      );
    }

    // decide what ought to be played
    const fileToPlay = !args.length ? randomSfx() : sfxBasedOnTag(args);

    if (!fileToPlay) {
      return msg.reply('No matches. Use \'vcsfx tags\' to see options');
    }
    // use fs to check validity. connection.play will handle invalid inputs fine
    // but some feedback is good for debug/ux/whatever
    fs.access(fileToPlay, err => {
      if (err) {
        msg.reply('Something seems wrong with the sound file. Try again later');
        console.log(`${err} thrown trying to access sound file`);
        return;
      }
    });
    // when two things try to play at once, it just overrides the older
    msg.member.voice.channel.join()
    .then(connection => {
      // NOTE: if the file[path] is invalid then this just finishes immediately
      const dispatch = connection.play(fileToPlay, { volume: 0.8});
      dispatch.on('start', () => {
          console.log(`I should be playing ${fileToPlay} now`);
      });
      dispatch.on('error', () => {
        msg.reply('We had some trouble playing that one. Try again later.');
        console.log(`Error while playing ${fileToPlay}`);
        connection.disconnect();
      });
      dispatch.on('finish', () => {
        console.log(`I should be done playing ${fileToPlay} now`);
        connection.disconnect();
      });
    })
    .catch(err => {
        msg.reply('Something went wrong while joining voice. Try again later');
        console.log(`Error joining voice: ${err}`);
    });
    
  }
}

function randomSfx() {
  return randomSfxFromList(vcsfxsupp.sfxsupp);
}

function sfxBasedOnTag(taglist) {
  const matchingSfx = vcsfxsupp.sfxsupp.filter(sfxitem => {
    return sfxitem.tags.some(tag => {
      return taglist.includes(tag);
    });
  });
  return matchingSfx.length ? randomSfxFromList(matchingSfx) : undefined;
}

function randomSfxFromList(sfxList) {
  return buildPathToSound(utils.pickRandomly(sfxList));
}

function buildPathToSound(sfxsuppobj) {
  if (!sfxsuppobj.name) {
    console.log('Tried to build path to audio file but no name provided!');
    return;
  }
  return REL_PATH_TO_SOUND_DIR + sfxsuppobj.name;
}
