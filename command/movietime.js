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
      msg.reply('on/off not specified. Assuming that it is MOVIE TIME');
      targetState = 'on'
    } else {
      targetState = args[0].toLowerCase();
    }

    togglerMv(msg, targetState);
  }
}

function togglerMv(msg, state) {
  if (!(msg.channel.type === 'text')) {
    return msg.reply('I dunno how you managed it but this appears to not be a text channel');
  }

  if (state === 'on') {
    permissionsHandler(msg.channel, true);
  } else if (state === 'off') {
    msg.channel.send('@everyone \nMovie time is over. Return to your previous duties, citizens')
    .then(() => {
      permissionsHandler(msg.channel, false);
    });
  } else {
    msg.reply(`${state} is not something I recognize. Use \'on\' or \'off\'.`);
  }
}

function permissionsHandler(channel, boolState) {
  channel.updateOverwrite(channel.guild.roles.everyone, 
    { 
      ADD_REACTIONS : boolState,
      SEND_MESSAGES : boolState
    })
    .then(() => {
      if (boolState) {
        channel.send('@everyone \nMovie time has begun and this channel is liberated!');
      }
    })
    .catch(() => {
      channel.send('I could not update this channel\'s permissions for everyone'
        + '\n Make sure I have been granted the permission to manage channel permissions.'
      );
    });
}