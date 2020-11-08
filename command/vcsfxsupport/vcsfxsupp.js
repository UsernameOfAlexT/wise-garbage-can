// dunno if tagname is really needed but it looks cleaner to me
exports.tags = new Map()
  .set("what", {
    "tagname": 'what',
    "desc": 'Expressions of your confusion'
  })
  .set("short", {
    "tagname": 'short',
    "desc": 'Short soundbites'
  })
  .set("long", {
    "tagname": 'long',
    "desc": 'Longer soundbites'
  })
  .set("nonsense", {
    "tagname": 'nonsense',
    "desc": 'Stuff that makes no sense'
  })
  .set("fightme", {
    "tagname": 'fightme',
    "desc": 'Fight me'
  })
  .set("lol", {
    "tagname": 'lol',
    "desc": 'Laugh at the misfortune of others'
  })
  .set("end", {
    "tagname": 'end',
    "desc": 'Something really obnoxious to end conversations with'
  })
  .set("punch", {
    "tagname": 'punch',
    "desc": 'Use one of these to if you can\'t think of a punchline'
  })


// contains file name in sound and tags
exports.sfxsupp = [
  {
    "name": 'wgat.ogg',
    "tags": [
      exports.tags.get("what").tagname,
      exports.tags.get("short").tagname
    ]
  },
  {
    "name": 'jumpedoverbusses.ogg',
    "tags": [
      exports.tags.get("nonsense").tagname,
    ]
  },
  {
    "name": 'laughatdanger.ogg',
    "tags": [
      exports.tags.get("lol").tagname,
      exports.tags.get("fightme").tagname
    ]
  },
  {
    "name": 'whothehell.ogg',
    "tags": [
      exports.tags.get("fightme").tagname,
    ]
  },
  {
    "name": 'longsword.ogg',
    "tags": [
      exports.tags.get("nonsense").tagname,
      exports.tags.get("long").tagname
    ]
  },
  {
    "name": 'todd.ogg',
    "tags": [
      exports.tags.get("fightme").tagname,
      exports.tags.get("long").tagname
    ]
  },
  {
    "name": 'paperdollman.ogg',
    "tags": [
      exports.tags.get("end").tagname,
      exports.tags.get("long").tagname
    ]
  },
  {
    "name": 'ezmodo.ogg',
    "tags": [
      exports.tags.get("lol").tagname,
      exports.tags.get("nonsense").tagname,
      exports.tags.get("long").tagname
    ]
  },
  {
    "name": 'unwanted.ogg',
    "tags": [
      exports.tags.get("end").tagname,
      exports.tags.get("long").tagname
    ]
  },
  {
    "name": 'themalefantasy.ogg',
    "tags": [
      exports.tags.get("punch").tagname,
      exports.tags.get("long").tagname
    ]
  }
]
