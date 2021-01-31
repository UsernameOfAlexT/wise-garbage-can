const utils = require('../utils.js');

let PhraseBase = function (word, subject = true, connector = false, descphrase = false) {
  this.word = word;
  // todo: maybe it'd be better to keep these in a set
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

// Proper Name def

exports.Named = function (word) {
  PhraseBase.call(this, word, false);
  this.named = true;
}
exports.Named.prototype = Object.create(PhraseBase.prototype);
exports.Named.prototype.constructor = exports.Named;
exports.Named.prototype.isValidNext = function (phrasebase) {
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

// Singular Connector def

exports.SingleConnector = function (word) {
  PhraseBase.call(this, word, false, true);
}
exports.SingleConnector.prototype = Object.create(PhraseBase.prototype);
exports.SingleConnector.prototype.constructor = exports.SingleConnector;
exports.SingleConnector.prototype.isValidNext = function (phrasebase) {
  return phrasebase.named;
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

// Leadin def

exports.Leadin = function (word) {
  PhraseBase.call(this, word, false);
  this.starter = true;
}
exports.Leadin.prototype = Object.create(PhraseBase.prototype);
exports.Leadin.prototype.constructor = exports.Leadin;
exports.Leadin.prototype.isValidNext = function (phrasebase) {
  return phrasebase.subject || phrasebase.named;
}

/**
 * Get a joined string of valid selections from chainlist
 * 
 * @param {Array} chainlist 
 * @param {Number} iterations 
 */
exports.chain = function (chainlist, iterations) {
  let selected = [];

  let valid_start = chainlist.filter(phrase => phrase.starter || phrase.descphrase);
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
