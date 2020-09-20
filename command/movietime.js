module.exports = {
  name: 'movietime',
  aliases: ['mvt'],
  cd: 10,
  desc: 'Open/close this channel for movie time',
  disallowDm: true,
  ownerOnly: true,
  usage: '[on/off]',
  execute(msg, args) {
    let targetState;
    if (!args.length) {
      msg.reply('on/off not specified. Assuming that it is MOVIE TIME')
        .catch(err => {
          console.error(`Failed to reply. Probably a permissions error \n`, err);
        });
      targetState = 'on'
    } else {
      targetState = args[0].toLowerCase();
    }

    togglerMv(msg, targetState);
  }
}

// TODO the msg permission failure logic is repeated a bunch
function togglerMv(msg, state) {
  if (!(msg.channel.type === 'text')) {
    return msg.reply('I dunno how you managed it but this appears to not be a text channel');
  }

  if (state === 'on') {
    permissionsHandler(msg.channel, true, msg.author);
  } else if (state === 'off') {
    msg.channel.send('@everyone \nMovie time is over. Return to your previous duties, citizens')
    .then(() => {
      permissionsHandler(msg.channel, false, msg.author);
    })
    .catch(() => {
      msg.author.send('I have no permission to send messages there, so movietime is probably off already')
        .catch(err => {
          console.error(`${msg.author.tag} failed to DM with permission warning. \n`, err);
        });
    });
  } else {
    msg.reply(`${state} is not something I recognize. Use \'on\' or \'off\'.`)
    .catch(() => {
      msg.author.send('I have no permission to send messages there, and I didn\'t understand the state anyway')
        .catch(err => {
          console.error(`${msg.author.tag} failed to DM with permission warning. \n`, err);
        });
    });
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
      author.send('I could not update that channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.'
      )
        .catch(err => {
          console.error(`${author.tag} failed to DM with permission warning. \n`, err);
        });
    });
}