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