const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  VoiceConnectionStatus
} = require('@discordjs/voice');
const vcsfxsupp = require('./vcsfxsupport/vcsfxsupp.js');
const utils = require('../utils.js');
const envutils = require('../envutils.js');
const fs = require('fs');
// NOTE: this seems to need to be relative to index, and not this module
const REL_PATH_TO_SOUND_DIR = 'sound/';
const TAG_SOUND_PREFIX = '-t';

/**
 * Static Audio files stored locally for now.
 * Not a huge mission critical app so S3 and stuff is kinda overkill
 */
// it is preferable to have all audio as Ogg/WebM for performance

module.exports = {
  name: 'vcsfx',
  aliases: ['vsfx', 'vcfx', 'vx'],
  cd: 11,
  desc: 'Play some random sounds in the voice channel you are in. Very annoying! '
    + 'Use \'vcsfx tags\' to see tag options to filter. '
    + 'Use \'vcsfx names\' to see names to use if getting an exact sound '
    + '\nInclude \' ' + TAG_SOUND_PREFIX + ' \' to search by tags '
    + 'for example:  \'vcsfx ' + TAG_SOUND_PREFIX + ' ready\''
    + '\n(If getting exact sounds, only the first name given is considered)',
  disallowDm: false,
  needSendPerm: true,
  cleanupRequest: true,
  usage: '{optional tags}',
  execute(msg, args) {
    // handle various informational commands
    const infomsg = handleInfoCommands(args);
    if (infomsg.length) {
      return msg.author.send(infomsg.join('\n'));
    }

    // perform various checks to make sure what we are about to try is valid
    if (!msg.channel.guild) {
      return msg.author.send(
        `Only informational commands can be used outside of servers.` +
        `\n Use the help command for more on this.`
      );
    }

    if (!msg.channel.guild.available) { return; }

    if (!msg.member.voice.channel) {
      return utils.safeMention(msg,
        'That\'s a totally non-existent voice channel you\'re in. ' +
        'Join a real one and we\'ll talk.'
      );
    }

    // decide what ought to be played
    const fileToPlay = !args.length ? randomSfx() : specificSfx(args);

    if (!fileToPlay) {
      return utils.safeMention(msg,
        `No matches. Use \'vcsfx tags\' or \'vcsfx names\'` +
        `\nReminder: Include ${TAG_SOUND_PREFIX}` +
        ` for searching by tag`
      );
    }

    const connection = joinVoiceChannel({
      channelId: msg.member.voice.channel.id,
      guildId: msg.member.voice.channel.guild.id,
      adapterCreator: msg.member.voice.channel.guild.voiceAdapterCreator
    });

    // TODO does this fail messily for non opus?
    let resource = createAudioResource(fs.createReadStream(fileToPlay), {
      inputType: StreamType.OggOpus
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    // Various logging and error event handlers
    player.on(AudioPlayerStatus.Playing, () => {
      if (envutils.useDetailedLogging()) {
        console.log(`I should be playing ${fileToPlay} now`);
      }
    });
    player.on('error', error => {
      utils.safeMention(msg, 'We had some trouble playing that one. Try again later.');
      console.error(`Error while playing ${fileToPlay}: ${error}`);
      // this eventually falls naturally to the idle state
    });
    player.on(AudioPlayerStatus.Idle, () => {
      if (envutils.useDetailedLogging()) {
        console.log(`${fileToPlay} should no longer be playing`);
      }
      player.stop();
      connection.destroy();
    });
    
    // logging events etc. for the connection itself
    connection.on(VoiceConnectionStatus.Destroyed, () => {
      if (envutils.useDetailedLogging()) {
        console.log(`Voice connection has been destroyed`);
      }
    });
  }
}

function handleInfoCommands(args) {
  const msgToBuild = [];
  if (!args[0]) {
    return msgToBuild;
  }

  if (args[0].toLowerCase() === 'tags') {
    vcsfxsupp.tagsToDesc.forEach((val, key) => {
      msgToBuild.push(`Tag: ${key} | Description: ${val}`);
    });
  }

  if (args[0].toLowerCase() === 'names') {
    vcsfxsupp.sfxsupp.forEach((soundobj, commonname) => {
      msgToBuild.push(`Sound Name: ${commonname} | Description: ${soundobj.desc}`);
    });
  }

  return msgToBuild;
}

function randomSfx() {
  return randomSfxFromList([...vcsfxsupp.sfxsupp.values()]);
}

function specificSfx(args) {
  // there should be at least one arg in this case
  return args.includes(TAG_SOUND_PREFIX)
    ? sfxBasedOnTag(args.filter(tag => {
      return vcsfxsupp.tagsToDesc.has(tag);
    }))
    : sfxBasedOnExactName(args[0])
    ;
}

function sfxBasedOnExactName(name) {
  const vsfxobj = vcsfxsupp.sfxsupp.get(name);
  return vsfxobj ? buildPathToSound(vsfxobj) : undefined;
}

function sfxBasedOnTag(taglist) {
  const sfxobjlist = [...vcsfxsupp.sfxsupp.values()];
  const matchingSfx = sfxobjlist.filter(sfxitem => {
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
    console.error('Tried to build path to audio file but no name provided!');
    return;
  }
  return REL_PATH_TO_SOUND_DIR + sfxsuppobj.name;
}
