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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const { MessageEmbed } = require('discord.js');
// NOTE: this seems to need to be relative to index, and not this module
const REL_PATH_TO_SOUND_DIR = 'sound/';
const TAG_ARG = 'tags';
const NAME_ARG = 'name';
const SUBCMD_NAME = 'vsfxnames';
const SUBCMD_TAG = 'vsfxtags';
const SUBCMD_PLAY = 'vsfxplay';

/**
 * Static Audio files stored locally for now.
 * Not a huge mission critical app so S3 and stuff is kinda overkill
 */
// it is preferable to have all audio as Ogg/WebM for performance

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vsfx')
    .setDescription('Play some random sounds in the voice channel you are in. Very annoying!')
    .addSubcommand(subcmd =>
      subcmd.setName(SUBCMD_NAME)
        .setDescription(`See a list of names for use with ${SUBCMD_PLAY}`)
    )
    .addSubcommand(subcmd =>
      subcmd.setName(SUBCMD_TAG)
        .setDescription(`See a list of tags for use with ${SUBCMD_PLAY}`)
    )
    .addSubcommand(subcmd =>
      subcmd.setName(SUBCMD_PLAY)
        .setDescription('Play some annoying sounds in your current voice channel')
        .addStringOption(option =>
          option.setName(TAG_ARG)
            .setDescription(`Optional tag(s) to filter sounds by (use ${SUBCMD_TAG}).` +
              ' Separate tags using \"|\"')
        )
        .addStringOption(option =>
          option.setName(NAME_ARG)
            .setDescription(`Exact name of sound to play (use ${SUBCMD_NAME}). ` +
              'Takes priority over other options')
        )
    ),
  cd: 11,
  disallowDm: false,
  needSendPerm: true,
  execute(interaction) {
    // handle various informational commands
    if (interaction.options.getSubcommand() === SUBCMD_TAG) {
      let tagsMap = new Map();
      vcsfxsupp.tagsToDesc.forEach((val, key) => {
        tagsMap.set(`Tag: ${key}`, `${val}`);
      });
      return new InteractionReply(interaction)
        .withEmbedContent([getInfoEmbed("Tags", tagsMap)])
        .withReplyContent(`Valid Tags for use with ${SUBCMD_PLAY}`)
        .replyTo();
    } else if (interaction.options.getSubcommand() === SUBCMD_NAME) {
      let namesMap = new Map();
      vcsfxsupp.sfxsupp.forEach((soundobj, commonname) => {
        namesMap.set(`Sound Name: ${commonname}`, `${soundobj.desc}`);
      });
      return new InteractionReply(interaction)
        .withEmbedContent([getInfoEmbed("Names", namesMap)])
        .withReplyContent(`Valid Names for use with ${SUBCMD_PLAY}`)
        .replyTo();
    }

    // perform various checks to make sure what we are about to try is valid
    if (!interaction.channel.guild) {
      return new InteractionReply(interaction)
        .withReplyContent('This cannot be used outside of servers')
        .replyTo();
    }

    if (!interaction.channel.guild.available) { return; }

    if (!interaction.member || !interaction.member.voice.channel) {
      return new InteractionReply(interaction)
        .withReplyContent('You have to be in a voice channel for this to work')
        .replyTo();
    }

    const tags = interaction.options.getString(TAG_ARG);
    const name = interaction.options.getString(NAME_ARG);

    // decide what ought to be played
    const fileToPlay = (tags || name) ? specificSfx(tags, name) : randomSfx();

    if (!fileToPlay) {
      return new InteractionReply(interaction)
        .withReplyContent(`No matches. Refer to ${SUBCMD_NAME} or ${SUBCMD_TAG}`)
        .replyTo();
    }

    new InteractionReply(interaction)
      .withThen(() => playOverVoice(interaction, fileToPlay))
      .withReplyContent(`Playing ${(tags || name) ? 'based on given' : 'randomly'}...`)
      .replyTo();
  }
}

function playOverVoice(interaction, fileToPlay) {
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.member.voice.channel.guild.id,
    adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
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
    new InteractionReply(interaction)
      .withReplyContent('Ran into trouble playing that, try again later')
      .replyTo();
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

/**
 * Get an embed representing the given information in the array
 */
function getInfoEmbed(embedTitle, contentsArray) {
  let embed = new MessageEmbed().setTitle(embedTitle);

  contentsArray.forEach((v, k) => embed.addField(k, v));
  return embed;
}

function randomSfx() {
  return randomSfxFromList([...vcsfxsupp.sfxsupp.values()]);
}

function specificSfx(tags, name) {
  let splittags = '';
  if (tags) {
    splittags = tags.split('|');
  }
  // at least one exists in this case
  return name
    ? sfxBasedOnExactName(name)
    : sfxBasedOnTag(splittags.filter(tag => {
      return vcsfxsupp.tagsToDesc.has(tag.trim());
    }));
}

function sfxBasedOnExactName(name) {
  const vsfxobj = vcsfxsupp.sfxsupp.get(name);
  return vsfxobj ? buildPathToSound(vsfxobj) : undefined;
}

function sfxBasedOnTag(taglist) {
  const sfxobjlist = [...vcsfxsupp.sfxsupp.values()];
  const matchingSfx = sfxobjlist.filter(sfxitem => {
    return sfxitem.tags.some(tag => {
      return taglist.includes(tag.trim());
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
