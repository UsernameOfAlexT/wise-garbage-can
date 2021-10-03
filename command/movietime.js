const ON = 'on';
const OFF = 'off';
const utils = require('../utils.js');
const phraserobj = require('../datalists/statusphraseobjs.js');
const phraser = require('../datalists/statusphraser.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const STATE_ARG = 'state';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movietime')
    .setDescription('Open/Close this channel for movie time')
    .addBooleanOption(option =>
      option.setName(STATE_ARG)
        .setDescription('Whether to set this channel open/close')
        .setRequired(true)
    ),
  cd: 5,
  disallowDm: true,
  ownerOnly: true,
  execute(interaction) {
    let targetState;
    if (!args.length) {
      utils.safeMention(
        msg,
        `\'${ON}\' or \'${OFF}\' not given. Assuming it is MOVIE TIME`
      );
      targetState = ON;
    } else {
      targetState = args[0].toLowerCase();
    }

    togglerMv(msg, targetState);
  }
}

function togglerMv(msg, state) {
  if (!(msg.channel.type === 'GUILD_TEXT')) {
    return utils.safeReply(msg,
      'This only works in ordinary text channels'
    );
  }

  if (state === ON) {
    permissionsHandler(msg.channel, true, msg.author);
  } else if (state === OFF) {
    utils.safeSend(
      msg,
      `@everyone \nMovie time is over, the channel has closed.\n${getRandomExtraStatus()}`,
      () => { permissionsHandler(msg.channel, false, msg.author) },
      true,
      'I have no permission to send messages there. Movietime may already be off'
    );
  } else {
    utils.safeMention(
      msg,
      `${state} is not something I recognize. Use \'${ON}\' or \'${OFF}\'.`
    );
  }
}

function permissionsHandler(channel, boolState, author) {
  channel.permissionOverwrites.create(channel.guild.roles.everyone,
    {
      ADD_REACTIONS: boolState,
      SEND_MESSAGES: boolState
    })
    .then(() => {
      if (boolState) {
        channel.send(
          `@everyone \nMovie time has begun! `
          + `The channel is open.\n${getRandomExtraStatus()}`
        );
      }
    })
    .catch(() => {
      utils.safeUserDm(author, 'I could not update that channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.');
    });
}

/**
 * Return some randomly constructed phrase.
 * Just to add some fun into the announcements
 */
function getRandomExtraStatus() {
  const wordcount = utils.withChance(80) ? 4 : 2;
  return phraserobj.chain(phraser.mvt_list, wordcount);
}
