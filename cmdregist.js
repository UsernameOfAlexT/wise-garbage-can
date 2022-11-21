'use strict';
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const envutils = require('./envutils.js');
envutils.setupEnvVars();
const bot_token = process.env.BOT_TOKEN;
const client_id = process.env.CLIENT_ID;

// very similar to in app.js, consider making common
const commands = [];
const commandFiles = fs.readdirSync('./command').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./command/${file}`);
  commands.push(command.data.toJSON());
  console.log(`Detected command: ${command.data.name}`)
}

const rest = new REST({ version: '9' }).setToken(bot_token);

let apiroute;
if (envutils.getCmdUpdateGuildId()) {
  console.log("Updating guild slash commands");
  apiroute = Routes.applicationGuildCommands(client_id, envutils.getCmdUpdateGuildId());
} else {
  console.log("Updating global slash commands");
  apiroute = Routes.applicationCommands(client_id);
}
console.log(`WILL PUT: ${apiroute}`);

rest.put(
  apiroute,
  { body: commands }
).then(() => {
  console.log(`SUCCESS PUT: ${apiroute}`);
  console.log('Commands updated successfully');
}).catch(err => {
  console.error(`Error registering slash commands ${err}`);
});
