const { master_name_array, tithetaker_responses } = require('../defaultlists.json');
const { Formatters } = require('discord.js');
const utils = require('../utils.js');
const DEF_TIME = 5;
const MAX_WAIT_TIME = 600;

module.exports = {
  name: 'tithe',
  aliases: ['temp'],
  cd: 6,
  desc: 'Make temporary messages that will be collected as tithes later',
  disallowDm: true,
  needSendPerm: true,
  usage: '{optional tithe time (seconds)} | [tithe message]',
  execute(msg, args) {
    if (!args.length) {
      return utils.safeReply(msg, "It is insulting to offer nothing to the gods!");
    }

    if (!msg.channel.guild.available || !msg.author) { return; }
    titheHandler(msg, args);
  }
}

function titheTime(msg, args) {
  // try our best to parse the first argument to a number if it seems to be specified
  if (args[1] && args[1] === '|') {
    const timeArg = args[0];
    // cut this part out from the message content
    args.splice(0, 2);
    const parsedTime = parseInt(timeArg, 10);
    if (isNaN(parsedTime)) {
      msg.channel.send(`Fool! ${timeArg} is no number I know. I will use the default of ${DEF_TIME}`);
      return DEF_TIME;
    }
    return parsedTime;
  }
  return DEF_TIME;
}

function titheHandler(msg, args) {
  const timeUntilTithe = titheTime(msg, args);

  if (timeUntilTithe > MAX_WAIT_TIME) {
    return utils.safeReply(msg, `The gods are impatient and will not wait more than ${MAX_WAIT_TIME} second(s)`);
  }

  const content = args.join(' ');

  msgToBuild = [];
  msgToBuild.push(`${Formatters.userMention(msg.author.id)} offers the following tithe: `);
  msgToBuild.push(`\n${content}\n`);
  msgToBuild.push(`This tithe will be collected in ${timeUntilTithe} seconds(s).`);

  msg.channel.send(msgToBuild.join('\n'))
    .then(titheMsg => {
      msg.delete()
        .catch(() => {
          utils.safeReply(msg, 'I have failed to delete the original tithe');
        })
      setTimeout(() => titheMsg.delete()
        .then(() => {
          titheMsg = [];
          titheMsg.push(`Your tithe has been collected by ${utils.pickRandomly(master_name_array)}`);
          titheMsg.push(`${utils.pickRandomly(tithetaker_responses)}`);
          utils.safeMention(msg, titheMsg.join('\n'));
        })
        .catch(() => {
          utils.safeReply(msg, 'I have failed in my duty to collect this tithe');
        })
        , timeUntilTithe * 1000);
    });
}
