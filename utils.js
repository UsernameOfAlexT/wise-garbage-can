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

/**
 * Pick up to n random unique choices from the given list.
 * If n is greater than the length of the list, then just returns
 * the contents of the list in a random order
 * 
 * @param {Array} choices 
 * @param {number} n
 */
// TODO untested. probably something wrong with it somehow
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