'use strict';
const fs = require('fs');
const { Client, Intents, Collection, Permissions } = require('discord.js');
const envutils = require('./envutils.js');
const utils = require('./utils.js');
const phraserobj = require('./datalists/statusphraseobjs.js');
const phraser = require('./datalists/statusphraser.js');
const bot_token = process.env.BOT_TOKEN;
const prefix = process.env.CMD_PREFIX;

// TODO perhaps the interactions API offers ways for commands to not need message content
const intentsUsed = new Intents();
intentsUsed.add(
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.GUILDS
);

const client = new Client({ intents: intentsUsed });
const cooldowns = new Collection();
let voiceStateLastUpdate = Date.now();
const VOICE_MIN_CD = 5000; // 5 seconds min between updates

client.commands = new Collection();
// get all files in commands, then reduce to only things ending in .js
const commandFiles = fs.readdirSync('./command').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./command/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logging Level: ${envutils.useDetailedLogging() ? "debug" : "standard"}`);
  console.log('I am ready to fight robots');

  // roll a random status upon each startup. For fun.
  const randactivity = phraserobj.chain(phraser.standard_list, 4);
  client.user.setActivity(randactivity, { type: utils.pickRandomly(phraser.relevant_start_statuses) });
});

client.on('messageCreate', message => {
  // can check guide for explanations on most of these
  // ignore things without prefixes and from bots
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  // regex for 1+ spaces
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // do we actually have this command?
  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) {
    return;
  }

  // DM checking
  const invokedFromDm = message.channel.type === 'DM';
  if (command.disallowDm && invokedFromDm) {
    return message.reply(`${commandName}, you can\'t use that here`);
  }
  
  // permissions checking for sending messages (a basic requirement)
  if (command.needSendPerm && !invokedFromDm
    && !(message.channel.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES))) {
    const msgToBuild = [];
    msgToBuild.push(`I was going to execute ${commandName}`);
    msgToBuild.push('But, I need permission to send messages in the channel you requested it');
    msgToBuild.push('Give me permission so I can meaningfully perform it.');
    msgToBuild.push('Or, if the command was going to grant permission, it may just be on cooldown.');
    return message.author.send(msgToBuild.join('\n'))
      .catch(err => {
        console.error(`${message.author.tag} failed to DM with permission warning. \n`, err);
      });
  }

  // Owner only checking
  if (command.ownerOnly && !(message.author.id === message.guild.ownerId)) {
    return message.reply(`${commandName}\'s power can be used only by the server owner`)
  }

  // checking cooldowns to prevent spam
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cdTime = (command.cd || 3) * 1000;

  // get the actual time the cd expires and respond if not yet time
  if (timestamps.has(message.author.id)) {
    const expireTime = timestamps.get(message.author.id) + cdTime;

    if (now < expireTime) {
      const left = (expireTime - now) / 1000;
      return message.reply(`\'${command.name}\' cannot be used again just yet. Wait ${left.toFixed(1)} more second(s)`)
        .catch(() => {
          // most likely culprit is missing permissions, so try to DM
          const msgToBuild = [];
          msgToBuild.push('I am DMing you because I lack permission to respond in the channel you requested me from');
          msgToBuild.push(`\'${command.name}\' cannot be used again just yet. Wait ${left.toFixed(1)} more second(s)`);
          message.author.send(msgToBuild.join('\n'))
            .catch(err => {
              console.error(`${message.author.tag} failed to DM with permission warning. \n`, err);
            });
        });
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cdTime);

  // delete the original invoke msg from non-dms if required
  if (!invokedFromDm && command.cleanupRequest) {
    const hasDeleteMsgPerm = message.channel.permissionsFor(client.user).has(Permissions.FLAGS.MANAGE_MESSAGES);
    if (envutils.useDetailedLogging()) {
      console.log(`${hasDeleteMsgPerm ? "Has" : "Lacks"} delete permissions for this channel`);
    }
    if (hasDeleteMsgPerm) {
      message.delete()
        .catch(err => {
          console.error(`${err} thrown while trying to delete ${commandName} request`)
        });
    }
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(`${commandName} failed. Something went wrong. Contact Dev and yell at them to fix this`);
  }
});

// Sometimes change activity on some voice state changes. Also for fun.
client.on('voiceStateUpdate', (oldState, newState) => {
  // Prevent changing too frequently
  const now = Date.now();

  // if this isn't set for some reason, then assume it does not apply
  if (voiceStateLastUpdate) {
    const expireTime = voiceStateLastUpdate + VOICE_MIN_CD;
    // don't do this every possible time
    if (now < expireTime || utils.withChance(75)) {
      return;
    }
  }
  voiceStateLastUpdate = now;
  const subject = newState.member.displayName ? newState.member.displayName : "Someone";
  // Replace the placeholder string
  const formattedact = phraserobj.chain(phraser.user_act_list, 3)
    .replaceAll(phraser.named_placeholder, subject);
  client.user.setActivity(
    formattedact,
    { type: utils.pickRandomly(phraser.relevant_start_statuses) }
  ).catch(err => console.error(err));
});

client.login(bot_token);
