const ytdl = require('ytdl-core-discord');
const envutils = require('../../envutils.js');

module.exports = {
  name: 'single',
  aliases: ['playone'],
  cd: 11,
  desc: 'Play a single video (\'s audio)',
  disallowDm: true,
  vcRequired: true,
  usage: '[url]',
  execute(msg, args) {
    if (!args.length) {
      return msg.reply('Need a source YouTube url to play from');
    }
    if (!ytdl.validateURL(args[0])) {
      return msg.reply(`${args[0]} does not look like a valid YouTube url`);
    }
    // TODO how does this interact with other modules that use voice?
    msg.member.voice.channel.join()
      .then(connection => {
        play(msg, connection, args[0])
      })
      .catch(err => {
        msg.reply('Something went wrong while joining voice. Try again later');
        console.error(`Error joining voice: ${err}`);
      })
  }
}

async function play(msg, connection, yturl) {
  const dispatch = connection.play(await ytdl(yturl, {filter : 'audioonly' }),
    {
      type: 'opus',
      volume: 0.35
    }
  );

  dispatch.on('start', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`I should be playing ${yturl} now`);
    }
  });
  dispatch.on('error', (err) => {
    msg.reply(`There was an error playing ${yturl}. Yell at Dev!`);
    console.error(`Error while playing ${yturl}: ${err}`);
    connection.disconnect();
  });
  dispatch.on('finish', () => {
    if (envutils.useDetailedLogging()) {
      console.log(`I should be done playing ${yturl} now`);
    }
    connection.disconnect();
  });
}
