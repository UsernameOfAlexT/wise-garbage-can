const ON = 'on';
const OFF = 'off';

module.exports = {
  name: 'movietime',
  aliases: ['mvt'],
  cd: 5,
  desc: 'Open/close this channel for movie time',
  disallowDm: true,
  ownerOnly: true,
  cleanupRequest: true,
  usage: `[${ON}/${OFF}]`,
  execute(msg, args) {
    let targetState;
    if (!args.length) {
      safeReply(
        msg,
        `\'${ON}\' or \'${OFF}\' not given. Assuming it is MOVIE TIME`,
        () => { },
        'I had no permission to send messages there; Assuming it is MOVIE TIME'
      );
      targetState = ON;
    } else {
      targetState = args[0].toLowerCase();
    }

    togglerMv(msg, targetState);
  }
}

// TODO may be beneficial to make the 'safe message' functions common
/**
 * Reply to a message, handling possible permissions errors by DMing
 * the original sender of the message
 * 
 * @param {Discord.Message} msg message to reply to. Also used to extract other information
 * @param {String} content content of the reply
 * @param {Function} thenable paramless function to execute after sending
 * @param {String} errorContent message to send if the reply fails
 * @param {Boolean} asReply whether to send as a reply mentioning the original author
 */
function safeReply(
  msg,
  content,
  thenable = () => { },
  errorContent = 'I have no permission to send messages there.',
  asReply = true,
) {
  const promised = asReply
    ? msg.reply(content)
    : msg.channel.send(content)
    ;
  promised.then(thenable)
    .catch(() => safeUserDm(msg.author, errorContent));
}

/**
 * DM the given user. Catch and log errors
 * 
 * @param {Discord.User} user user to DM 
 * @param {String} content text content
 */
function safeUserDm(user, content) {
  user.send(content)
    .catch(err => {
      console.error(`${msg.author.tag} failed to DM with permission warning. \n`, err);
    });
}

function togglerMv(msg, state) {
  if (!(msg.channel.type === 'text')) {
    return msg.reply('I dunno how you managed it but this appears to not be a text channel');
  }

  if (state === ON) {
    permissionsHandler(msg.channel, true, msg.author);
  } else if (state === OFF) {
    safeReply(
      msg,
      '@everyone \nMovie time is over. Return to your previous duties, citizens',
      () => { permissionsHandler(msg.channel, false, msg.author) },
      'I have no permission to send messages there. Movietime may already be off',
      false
    );
  } else {
    safeReply(
      msg,
      `${state} is not something I recognize. Use \'${ON}\' or \'${OFF}\'.`
    );
  }
}

function permissionsHandler(channel, boolState, author) {
  channel.updateOverwrite(channel.guild.roles.everyone,
    {
      ADD_REACTIONS: boolState,
      SEND_MESSAGES: boolState
    })
    .then(() => {
      if (boolState) {
        channel.send('@everyone \nMovie time has begun and this channel is liberated!');
      }
    })
    .catch(() => {
      safeUserDm(author, 'I could not update that channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.');
    });
}