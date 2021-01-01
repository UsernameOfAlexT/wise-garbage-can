'use strict';
const fs = require('fs');
const Discord = require('discord.js');
const envutils = require('./envutils.js');
const bot_token = process.env.BOT_TOKEN;
const prefix = process.env.CMD_PREFIX;

const intentsUsed = new Discord.Intents(Discord.Intents.ALL);
intentsUsed.remove([
  'GUILD_BANS',
  'GUILD_PRESENCES',
  'GUILD_INVITES',
  'GUILD_INTEGRATIONS',
  'GUILD_WEBHOOKS'
]);

const client = new Discord.Client({ ws: { intents: intentsUsed } });
const cooldowns = new Discord.Collection();

client.commands = new Discord.Collection();
// get all files in commands, then reduce to only things ending in .js
const commandFiles = fs.readdirSync('./command').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./command/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logging Level: ${envutils.useDetailedLogging() ? "debug" : "standard"}`);
  console.log('I am ready to fight robots');
});

client.on('message', message => {
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
  const invokedFromDm = message.channel.type === 'dm';
  if (command.disallowDm && invokedFromDm) {
    return message.reply(`${commandName}, you can\'t use that here`);
  }

  // permissions checking for sending messages (a basic requirement)
  if (command.needSendPerm && !invokedFromDm
    && !(message.channel.permissionsFor(client.user).has('SEND_MESSAGES'))) {
    const msgToBuild = [];
    msgToBuild.push(`I was going to execute ${commandName}`);
    msgToBuild.push('But, I need permission to send messages in the channel you requested it');
    msgToBuild.push('Give me permission so I can meaningfully perform it.');
    msgToBuild.push('Or, if the command was going to grant permission, it may just be on cooldown.');
    return message.author.send(msgToBuild, { split: true })
      .catch(err => {
        console.error(`${message.author.tag} failed to DM with permission warning. \n`, err);
      });
  }

  // Owner only checking
  if (command.ownerOnly && !(message.author.id === message.guild.ownerID)) {
    return message.reply(`${commandName}\'s power can be used only by the server owner`)
  }

  // checking cooldowns to prevent spam
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
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
          message.author.send(msgToBuild, { split: true })
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
    const hasDeleteMsgPerm = message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES');
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

client.login(bot_token);
