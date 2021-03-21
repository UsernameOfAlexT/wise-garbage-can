const ytdl = require('ytdl-core-discord');
const envutils = require('../../envutils.js');
// TODO this just loops the input for now.
// eventually this should grab things from the database instead

module.exports = {
  name: 'start',
  aliases: ['on', 'begin'],
  cd: 11,
  desc: 'Tune in and listen',
  disallowDm: true,
  vcRequired: true,
  usage: '',
  execute(msg, args, connectionCore) {
    if (!args.length) {
      return msg.reply('Need a source YouTube url to play from');
    }
    if (!ytdl.validateURL(args[0])) {
      return msg.reply(`${args[0]} does not look like a valid YouTube url`);
    }

    if (connectionCore.getConnection(msg.client)) {
      play(msg, connectionCore.getConnection(msg.client), args[0]);
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
          play(msg, connection, args[0]);
          connectionCore.setConnection(msg.client, connection);
        })
        .catch(err => {
          msg.reply('Something went wrong while joining voice. Try again later');
          console.error(`Error joining voice: ${err}`);
        })
    }
  }
}

async function play(msg, connection, yturl) {
  const dispatch = connection.play(await ytdl(yturl, { filter: 'audioonly' }),
    {
      type: 'opus',
      volume: 0.35
    }
  );

  dispatch.on('start', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`Radio playing ${yturl}`);
    }
  });
  dispatch.on('error', (err) => {
    msg.reply(`There was an error playing ${yturl}. Yell at Dev!`);
    console.error(`Error while playing ${yturl}: ${err}`);
    connection.disconnect();
  });
  dispatch.on('finish', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`Changing off of ${yturl} now`);
    }
    
    // TODO the switching logic for picking the next feature should go here later
    play(msg, connection, yturl);
  });
}
