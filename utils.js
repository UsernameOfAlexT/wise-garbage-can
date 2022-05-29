const { Formatters } = require('discord.js');

exports.pickSafely = function (targetIndex, sourceList) {
  return targetIndex < sourceList.length
    ? sourceList[targetIndex]
    : '???'
}

/**
 * Randomize an integer between min and max
 * 
 * @param {number} max max, not inclusive
 * @param {number} min defaults to 0, inclusive
 */
exports.randomInt = function (max, min = 0) {
  const roundMin = Math.ceil(min)
  const roundMax = Math.ceil(max);
  return Math.floor(Math.random() * (roundMax - roundMin) + roundMin);
}

/**
 * Returns true/false randomly with the percent chance of
 * true being the given value
 * 
 * @param {number} chance 
 */
exports.withChance = function (chance) {
  // shift up by one as randomInt actually gives integers 0-99 inclusive
  return (exports.randomInt(100) + 1) <= chance;
}

/**
 * Pick a random entry from the provided array
 * 
 * @param {Array} choices 
 */
exports.pickRandomly = function (choices) {
  let choseni = exports.randomInt(choices.length);
  let choiceItem = exports.pickSafely(choseni, choices);
  return choiceItem;
}

/**
 * Pick up to n random unique choices from the given list.
 * If n is greater than the length of the list, then just returns
 * the contents of the list in a random order
 * 
 * @param {Array} choices 
 * @param {number} n
 */
exports.choose = function (choices, n) {
  const chosenItems = [];

  for (let m = 0; m < n; m++) {
    let choseni = exports.randomInt(choices.length);
    chosenItems.push(choices[choseni]);
    choices.splice(choseni, 1);
    if (choices.length === 0) {
      break;
    }
  }
  return chosenItems;
}

/**
 * Attempts to reply to the given message using discord's reply feature. 
 * If this fails (usually due to a deleted message) then fall back onto the
 * legacy behaviour of using mentions.
 * 
 * @param {Discord.Message} message message to attempt to reply to
 * @param {String} reply the reply content
 */
exports.safeReply = function (message, reply) {
  message.reply(reply).catch(err => {
    console.log("Tried to reply to a deleted message");
    exports.safeMention(message, reply);
  });
}

/**
 * Attempts to reply to the given interaction if not already replied.
 * <BR> Posts a followup if it has already been replied to
 * 
 * @param {Discord.Interaction} interaction interaction to attempt to reply to
 * @param {String} reply the reply content
 * @param {Boolean} ephemeral ephemerality of the reply
 * @param {Function} thenable function to run after a successful reply
 */
// TODO this has become unmaintainable. Switch to the builder method
exports.safeReply = function (interaction, reply, ephemeral = true, thenable = () => { }) {
  if (interaction.replied) {
    interaction.followUp({ content: reply, ephemeral: ephemeral })
      .then(thenable)
      .catch(err => {
        console.log(`Could not followup to interaction due to: ${err}`);
      });
    return;
  }

  interaction.reply({ content: reply, ephemeral: ephemeral })
    .then(thenable)
    .catch(err => {
      console.log(`Could not reply to interaction due to: ${err}`);
    });
}

/**
 * Replicates the legacy reply behaviour of tagging the user in a mention with
 * some added checks
 * 
 * @param {Discord.Message} message message whose sender will be tagged
 * @param {String} reply reply content
 */
exports.safeMention = function (message, reply) {
  exports.safeSend(message, Formatters.userMention(message.author.id) + reply);
}

/**
 * Send a message to the same channel as another message, catching
 * any errors.
 * 
 * @param {Discord.Message} message message whose sender will be tagged
 * @param {String} reply reply content
 * @param {Function} thenable paramless function to execute after sending
 * @param {Boolean} dmfallback whether to send a dm as fallback behavior or just log
 * @param {String} dmContent fallback content for the dm
 */
exports.safeSend = function (
  message,
  reply,
  thenable = () => { },
  dmfallback = true,
  dmContent = ""
) {
  if (!message.author) {
    console.error("Tried to reply to a message with no author");
    return;
  }
  // if not provided, just send what would have been sent in the message + explanation
  const finalDmContent = (dmfallback && !dmContent)
    ? `(You are being DM'd because I have no permission to send in that channel)\n${reply}`
    : dmContent;

  const sendFailHandler = dmfallback
    ? () => exports.safeUserDm(message.author, finalDmContent)
    : err => console.error(`Unable to mention due to ${err}`);

  message.channel.send(reply)
    .then(thenable)
    .catch(sendFailHandler);
}

/**
 * DM the given user. Catch and log errors
 * 
 * @param {Discord.User} user user to DM 
 * @param {String} content text content
 */
exports.safeUserDm = function (user, content) {
  user.send(content)
    .catch(err => {
      console.error(`${user.tag} failed to DM with permission warning. \n`, err);
    });
}

