'use strict';
const fs = require('fs');
const Discord = require('discord.js');
const bot_token = process.env.BOT_TOKEN;
const prefix = process.env.CMD_PREFIX;
const client = new Discord.Client();

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

  if (command.disallowDm && message.channel.type === 'dm') {
    return message.reply(`${commandName}, you can\'t use that here`);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(`${commandName} failed. Something went wrong`);
  }
});

client.login(bot_token);
