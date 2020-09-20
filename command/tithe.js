const {master_name_array, tithetaker_responses} = require('../defaultlists.json');
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
      return msg.reply("It is insulting to offer nothing to the gods!");
    }
    
    if (!msg.channel.guild.available) { return; }
    // supposed to resolve to the author
    msg.channel.guild.members.fetch(msg)
      .then(titheAuthor => {
        titheHandler(msg, args, titheAuthor);
      })
      .catch(err => {
        msg.reply("Unholy magic prevents me from collecting your tithe");
        console.error(`${msg.author.tag} could not be resolved to a guildmember \n`, err);
      });
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

function titheHandler(msg, args, titheAuthor) {
  const timeUntilTithe = titheTime(msg, args);

  if (timeUntilTithe > MAX_WAIT_TIME) {
    return msg.reply(`The gods are impatient and will not wait more than ${MAX_WAIT_TIME} second(s)`);
  }

  const content = args.join(' ');

  msgToBuild = [];
  msgToBuild.push(`${titheAuthor.displayName} has offered the following tithe: `);
  msgToBuild.push(`\n${content}\n`);
  msgToBuild.push(`This tithe will be collected in ${timeUntilTithe} seconds(s).`);

  msg.channel.send(msgToBuild)
    .then(titheMsg => {
      msg.delete()
        .catch(() => {
          msg.reply('I have failed to delete the original tithe');
        })

      titheMsg.delete({ timeout: timeUntilTithe * 1000 })
        .then(() => {
          titheMsg = [];
          titheMsg.push(`Your tithe has been collected by ${titheTaker(master_name_array)}`);
          titheMsg.push(`${titheTaker(tithetaker_responses)}`);
          msg.reply(titheMsg);
        })
        .catch(() => {
          msg.reply('I have failed in my duty to collect this tithe');
        });
    });
}

function titheTaker(choices) {
  let choseni = utils.randomInt(choices.length);
  let subject = utils.pickSafely(choseni, choices);
  return subject;
}