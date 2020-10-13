exports.pickSafely = function (targetIndex, sourceList) {
  return targetIndex < sourceList.length 
  ? sourceList[targetIndex]
  : '???'
}

/**
 * Randomize an integer between 0 and max
 * @param {number} max 
 */
exports.randomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
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