'use strict';
const fs = require('fs');
const Discord = require('discord.js');
const bot_token = process.env.BOT_TOKEN;
const prefix = process.env.CMD_PREFIX;
const client = new Discord.Client();
const cooldowns = new Discord.Collection();

client.commands = new Discord.Collection();
// get all files in commands, then reduce to only things ending in .js
const commandFiles = fs.readdirSync('./command').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./command/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
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
  if (!client.commands.has(commandName)) {
    return;
  }

  const command = client.commands.get(commandName);

  // DM checking
  if (command.disallowDm && message.channel.type === 'dm') {
    return message.reply(`${commandName}, you can\'t use that here`);
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
      return message.reply(`\'${command.name}\' cannot be used again just yet. Wait ${left.toFixed(1)} more second(s)`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cdTime);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(`${commandName} failed. Something went wrong`);
  }
});

client.login(bot_token);
