const { master_name_array, tithetaker_responses } = require('../defaultlists.json');
const { Formatters } = require('discord.js');
const utils = require('../utils.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionReply } = require('../support/intereply.js');
const DEF_TIME = 5;
const MAX_WAIT_TIME = 600;
const TIME_ARG = 'time';
const NAME_ARG = 'tithe'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tithe')
    .setDescription('Make temporary messages that will be collected as tithes later')
    .addStringOption(option =>
      option.setName(NAME_ARG)
        .setRequired(true)
        .setDescription('Tithe Message'))
    .addIntegerOption(option =>
      option.setName(TIME_ARG)
        .setDescription('Time until collection in seconds (Max 600)')
    )
  ,
  cd: 6,
  disallowDm: true,
  needSendPerm: true,
  execute(interaction) {
    if (!interaction.channel.guild.available) { return; }
    titheHandler(interaction);
  }
}

function titheHandler(interaction) {
  const timeUntilTithe = interaction.options.getInteger(TIME_ARG) || DEF_TIME;
  const content = interaction.options.getString(NAME_ARG);

  if (timeUntilTithe > MAX_WAIT_TIME) {
    return new InteractionReply(interaction)
      .withReplyContent(`The gods are impatient and will not wait more than ${MAX_WAIT_TIME} second(s)`)
      .replyTo();
  }

  let msgToBuild = [];
  msgToBuild.push(`${Formatters.userMention(interaction.user.id)} offers the following tithe: `);
  msgToBuild.push(`\n${content}\n`);
  msgToBuild.push(`This tithe will be collected in ${timeUntilTithe} seconds(s).`);

  // perform a delayed edit instead using thenable
  new InteractionReply(interaction)
    .withReplyContent(msgToBuild.join('\n'))
    .withHidden(false)
    .withThen(() =>
      setTimeout(() => {
        let tithemsg = [];
        tithemsg.push(`Your tithe has been collected by ${utils.pickRandomly(master_name_array)}`);
        tithemsg.push(`${utils.pickRandomly(tithetaker_responses)}`);
        interaction.editReply(tithemsg.join('\n'))
          .catch(err => {
            new InteractionReply(interaction)
              .withReplyContent('Apologies. I have failed to collect this Tithe')
              .withHidden(false)
              .replyTo();
            console.error(`Failed to edit a tithe message`, err);
          })
        }
        , timeUntilTithe * 1000)
    )
    .replyTo();
}
