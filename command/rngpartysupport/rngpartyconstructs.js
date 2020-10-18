const partyData = require('../../datalists/rngparty.json');
const partyDataBackground = require('../../datalists/rngpartybackground.json');
const partyDataClasses = require('../../datalists/rngpartyclasses.json');
/** 
 * This could just be a .json but I can't find any way to reference
 * partyData's members in that case
*/
exports.full_name_constr = [
  {
    "chance": 15,
    "content": partyData.prefix_names
  },
  {
    "chance": 90,
    "content": partyData.first_names
  },
  {
    "chance": 30,
    "content": partyData.middle_names
  },
  {
    "chance": 100,
    "content": partyData.last_names
  },
  {
    "chance": 50,
    "content": partyData.suffix_names
  }
]

exports.backstory_constr = [
  {
    "chance": 100,
    "content": partyDataBackground.status
  },
  {
    "chance": 75,
    "content": partyDataBackground.origins
  }
]

exports.partyclass_constr = [
  {
    "chance": 90,
    "content": partyDataClasses.class_prefix
  },
  {
    "chance": 100,
    "content": partyDataClasses.class_base
  }
]