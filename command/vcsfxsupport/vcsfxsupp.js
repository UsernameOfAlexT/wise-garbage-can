// constants for the tags to reduce bugs from typos and inconsistencies
const WHAT = "what";
const MUSICAL = "musical";
const SHUTUP = "shutup";
const NONSENSE = "nonsense";
const FIGHTME = "fightme";
const LOL = "lol";
const END = "end";
const PUNCH = "punch";
const FU = "fu";
const YES = "yes";
const NO = "no";
const READY = "ready";
const HURRY = "hurry";
const CURSED = "cursed";

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
  .set(FU, 'Be rude')
  .set(YES, 'Confirm stuff!')
  .set(NO, 'Deny stuff!')
  .set(READY, 'Are you back from the washroom yet?')
  .set(HURRY, 'How long can it take to go to the washroom?')
  .set(CURSED, 'Cursed sounds that stick in your brain');


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
  })
  .set('fujiapples', {
    "name": 'fujiapples.ogg',
    "desc": 'Drunk Baking',
    "tags": [NONSENSE, PUNCH]
  })
  .set('stamos', {
    "name": 'stamos.ogg',
    "desc": 'STAMOS',
    "tags": [NONSENSE]
  })
  .set('madeyathink', {
    "name": 'think.ogg',
    "desc": 'Made ya think!',
    "tags": [PUNCH]
  })
  .set('v', {
    "name": 'vuser.ogg',
    "desc": 'Just talk about video games. There\'s only one rule',
    "tags": [SHUTUP]
  })
  .set('bonusducks', {
    "name": 'bonusducks.ogg',
    "desc": 'MERASMUS YOU ARE THE WORST ROOMATE',
    "tags": [NONSENSE]
  })
  .set('aoestart', {
    "name": 'aoestartg.ogg',
    "desc": 'Spam it',
    "tags": [HURRY]
  })
  .set('evil', {
    "name": 'evilpresence.ogg',
    "desc": 'It is evil to make people wait apparently',
    "tags": [HURRY, SHUTUP]
  })
  .set('fightrobots', {
    "name": 'fightrobots.ogg',
    "desc": 'METAL MEN WILL DIE',
    "tags": [READY]
  })
  .set('ohyeah', {
    "name": 'krabs.ogg',
    "desc": 'You know what this is',
    "tags": [YES]
  })
  .set('readyfriend', {
    "name": 'medready.ogg',
    "desc": 'Listen to the evil one every once in a while',
    "tags": [READY]
  })
  .set('pedroone', {
    "name": 'pedroone.ogg',
    "desc": 'Noooo',
    "tags": [NO]
  })
  .set('pedrotwo', {
    "name": 'pedrotwo.ogg',
    "desc": 'NOOOOO',
    "tags": [NO]
  })
  .set('pedrothree', {
    "name": 'pedrothree.ogg',
    "desc": 'NoOOOooo',
    "tags": [NO]
  })
  .set('reggie', {
    "name": 'reggie.ogg',
    "desc": 'For team kneepads',
    "tags": [READY]
  })
  .set('california', {
    "name": 'california.ogg',
    "desc": 'The greatest around',
    "tags": [CURSED, MUSICAL]
  })
  .set('konga', {
    "name": 'konga.ogg',
    "desc": '8',
    "tags": [CURSED, MUSICAL]
  })
  .set('snakeone', {
    "name": 'snakesone.ogg',
    "desc": 'Tunnel Snakes rule',
    "tags": [FU]
  })
  .set('snaketwo', {
    "name": 'snakestwo.ogg',
    "desc": 'We\'re the Tunnel Snakes',
    "tags": [CURSED]
  })