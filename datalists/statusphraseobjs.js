const utils = require('../utils.js');

let PhraseBase = function (word, subject = true, connector = false, descphrase = false) {
  this.word = word;
  this.subject = subject;
  this.connector = connector;
  this.descphrase = descphrase;
}

PhraseBase.prototype.isValidNext = function (phrasebase) {
  return false;
}

/**
 * Choose a sensible next part based from given choices, or a placeholder string
 * if none available
 * 
 * @param {Array} choices PhraseBases 
 */
PhraseBase.prototype.nextpart = function (choices) {
  let valid_choices = choices.filter(phrase => this.isValidNext(phrase));
  return utils.pickRandomly(valid_choices);
}

// Subject def

exports.Subject = function (word) {
  PhraseBase.call(this, word);
}
exports.Subject.prototype = Object.create(PhraseBase.prototype);
exports.Subject.prototype.constructor = exports.Subject;
exports.Subject.prototype.isValidNext = function (phrasebase) {
  return phrasebase.connector;
}

// Connector def

exports.Connector = function (word) {
  PhraseBase.call(this, word, false, true);
}
exports.Connector.prototype = Object.create(PhraseBase.prototype);
exports.Connector.prototype.constructor = exports.Connector;
exports.Connector.prototype.isValidNext = function (phrasebase) {
  return phrasebase.descphrase || phrasebase.subject;
}

// Desc def

exports.Descphrase = function (word) {
  PhraseBase.call(this, word, false, false, true);
}
exports.Descphrase.prototype = Object.create(PhraseBase.prototype);
exports.Descphrase.prototype.constructor = exports.Descphrase;
exports.Descphrase.prototype.isValidNext = function (phrasebase) {
  return phrasebase.subject;
}

// Terminator def

exports.Terminator = function (word) {
  PhraseBase.call(this, word, false, true);
}
exports.Terminator.prototype = Object.create(PhraseBase.prototype);
exports.Terminator.prototype.constructor = exports.Terminator;

/**
 * Get a joined string of valid selections from chainlist
 * 
 * @param {Array} chainlist 
 * @param {Number} iterations 
 */
exports.chain = function (chainlist, iterations) {
  let selected = [];

  let valid_start = chainlist.filter(phrase => phrase.subject || phrase.descphrase);
  let current = utils.pickRandomly(valid_start);
  // todo: the filtered lists should never change so probably can be cached
  for (let i = 0; i < iterations; i++) {
    // if nothing selected (after terminator perhaps) then exit
    if (!current.word || !current.nextpart) { break; }
    selected.push(current.word);
    if (i < iterations - 1) {
      current = current.nextpart(chainlist);
    }
  }
  return selected.join(' ');
}
