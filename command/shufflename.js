const {master_name_array} = require('../defaultlists.json');
const utils = require('../utils.js')

module.exports = {
  name: 'shufflename',
  cd: 3,
  desc: 'Randomize Nicknames',
  disallowDm: true,
  execute(msg, args) {


    let callingServer = msg.channel.guild;
    if (callingServer.available) {
      callingServer.members.fetch()
        .then((members) => {
          members.each((user) =>
            // attempt to change everybody
            user.setNickname(namePicker(), "I am super cool")
              .catch(() => { 
                msg.reply(`I failed to change ${user.displayName} \n They were too powerful`);
                console.error(`Could not change ${user.displayName}`);
              })
          )
        })
        .catch(() => {
          msg.reply("I failed to scramble");
          console.error("Failed to scramble");
         })
        .finally(() => msg.reply("The wheel has been spun"));
    }
  }
}

function namePicker() {
  let choseni = utils.randomInt(master_name_array.length);
  let subject = utils.pickSafely(choseni, master_name_array);
  return subject;
}