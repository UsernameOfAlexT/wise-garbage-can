// constants for the tags to reduce bugs from typos and inconsistencies
const WHAT = "what";
const MUSICAL = "musical";
const SHUTUP = "shutup";
const NONSENSE = "nonsense";
const FIGHTME = "fightme";
const LOL = "lol";
const END = "end";
const PUNCH = "punch";
const FU = "fu"

// map tagname keys to a description
exports.tagsToDesc = new Map()
  .set(WHAT, 'Expressions of your confusion')
  .set(MUSICAL, 'Music filled soundbites')
  .set(SHUTUP, 'Express your desire to make someone stop talking')
  .set(NONSENSE, 'Stuff that makes no sense')
  .set(FIGHTME, 'Fight me')
  .set(LOL, 'Laugh at the misfortune of others')
  .set(END, 'Something really obnoxious to end conversations with')
  .set(PUNCH, 'Use one of these if you can\'t think of a punchline')
  .set(FU, 'Be rude');


/**
 * Key: human-readable name for use with exact sound requests
 * 
 * Values:
 *  name: exact filename to read
 *  desc: human-readable description
 *  tags: tags associated with file
 */
exports.sfxsupp = new Map()
  .set('wgat', {
    "name": 'wgat.ogg',
    "desc": 'wgat',
    "tags": [WHAT]
  })
  .set('jumpbus', {
    "name": 'jumpedoverbusses.ogg',
    "desc": 'You jumped over summa mah busses',
    "tags": [NONSENSE]
  })
  .set('laughatdanger', {
    "name": 'laughatdanger.ogg',
    "desc": 'laugh in the face of danger',
    "tags": [LOL, FIGHTME]
  })
  .set('whothehell', {
    "name": 'whothehell.ogg',
    "desc": 'MIGHTY KAMINA',
    "tags": [FIGHTME]
  })
  .set('longswords', {
    "name": 'longsword.ogg',
    "desc": 'So many longswords',
    "tags": [NONSENSE]
  })
  .set('todd', {
    "name": 'todd.ogg',
    "desc": 'Do not mess with todd',
    "tags": [FIGHTME]
  })
  .set('paperdollman', {
    "name": 'paperdollman.ogg',
    "desc": 'The infamous paper doll man',
    "tags": [END, MUSICAL]
  })
  .set('ezmodo', {
    "name": 'ezmodo.ogg',
    "desc": 'Not even elementary schoolers play on easy mode',
    "tags": [NONSENSE]
  })
  .set('walmart', {
    "name": 'unwanted.ogg',
    "desc": 'Do all your shopping at walmart',
    "tags": [END, MUSICAL, NONSENSE]
  })
  .set('notmydad', {
    "name": 'funotdad.ogg',
    "desc": 'Not my dad',
    "tags": [FU]
  })
  .set('fuhonorplz', {
    "name": 'honorplz.ogg',
    "desc": 'honorplz',
    "tags": [FU]
  })
  .set('uno', {
    "name": 'uno.ogg',
    "desc": 'You didn\'t even need to break one of my candles to get it',
    "tags": [NONSENSE, PUNCH]
  })
  .set('loseropinion', {
    "name": 'loseropinion.ogg',
    "desc": 'Loser',
    "tags": [SHUTUP]
  })
  .set('soldierofdance', {
    "name": 'tfdance.ogg',
    "desc": 'Party in red spawn',
    "tags": [MUSICAL]
  })
  .set('malefantasy', {
    "name": 'themalefantasy.ogg',
    "desc": 'It appeals to the male fantasy',
    "tags": [PUNCH]
  });
