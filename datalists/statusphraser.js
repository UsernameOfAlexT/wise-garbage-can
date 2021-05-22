const { 
  Subject,
  Named,
  Connector,
  SingleConnector,
  Descphrase,
  Leadin,
  Terminator 
} = require('./statusphraseobjs.js');

exports.standard_list = [
  new Subject("Triangle"),
  new Subject("Box"),
  new Subject("Kingdom"),
  new Subject("Ocean"),
  new Subject("Stone"),
  new Subject("Tree"),
  new Subject("Rocketship"),
  new Subject("Castle"),
  new Subject("Man"),
  new Subject("Smuggler"),
  new Subject("Wizard"),
  new Subject("Knight"),
  new Subject("Barbarian"),
  new Subject("Warrior"),
  new Subject("Sailor"),
  new Subject("Lizard"),
  new Subject("Ghost"),
  new Subject("Turkey Club"),
  new Named("Jimmy Sprocket"),
  new Named("Chad McWinsalot"),
  new Named("Tumbleweed Joe"),
  new Named("Captain Cyclone"),
  new Named("Dustin Cash"),
  new Named("Glenn"),
  new Named("Martbelle"),
  new Named("Van Mundegaarde"),
  new Named("Dolph Holdhaagen"),
  new Named("Chowdersworth P. Gruelmangler"),
  new Named("Ridgelaw"),
  new Connector("Visits The"),
  new Connector("Fights The"),
  new Connector("Murders The"),
  new Connector("Hates The"),
  new Connector("Is Stolen By The"),
  new Connector("And The"),
  new SingleConnector("And The Secret Of"),
  new SingleConnector("And The Curse Of"),
  new SingleConnector("And The Revenge Of"),
  new SingleConnector("Challenges"),
  new SingleConnector("Is Not"),
  new SingleConnector("Is"),
  new Descphrase("Shitty"),
  new Descphrase("Phantom"),
  new Descphrase("Cursed"),
  new Descphrase("Musclebound"),
  new Descphrase("Diseased"),
  new Descphrase("Tiny"),
  new Descphrase("Notably Mundane"),
  new Descphrase("Holiday Themed"),
  new Descphrase("Haunted"),
  new Descphrase("Communist"),
  new Descphrase("French Canadian"),
  new Descphrase("Dutch"),
  new Leadin("A Lurid Tale:"),
  new Leadin("Underwater Pants:"),
  new Leadin("Tales of Interest:"),
  new Leadin("The Amazing"),
  new Leadin("The Fantastic"),
  new Leadin("The Diabolical"),
  new Leadin("The Legendary"),
  new Terminator("Uncut"),
  new Terminator("Professional"),
  new Terminator("Reloaded"),
  new Terminator("Deluxe Edition"),
  new Terminator("In Shocking 3D"),
];

exports.mvt_list = [
  new Subject("Triangle"),
  new Subject("Circle"),
  new Subject("Oval"),
  new Subject("Square"),
  new Subject("Blade"),
  new Subject("Stone"),
  new Subject("Oak Tree"),
  new Subject("Pod Person"),
  new Subject("Castle"),
  new Subject("Bee"),
  new Subject("Monkey"),
  new Subject("Immortal"),
  new Subject("Cursed Fish"),
  new Subject("Grape"),
  new Named("Jimmy Sprocket"),
  new Named("Jack Johnson"),
  new Named("John Jackson"),
  new Named("Chad McWinsalot"),
  new Named("Tumbleweed Joe"),
  new Named("Captain Cyclone"),
  new Named("Dustin Cash"),
  new Named("Glenn"),
  new Named("Martbelle"),
  new Named("Van Mundegaarde"),
  new Named("Dolph Holdhaagen"),
  new Named("Chowdersworth P. Gruelmangler"),
  new Named("Ridgelaw"),
  new Named("Totalbelow"),
  new Named("Cool Tapes"),
  new Connector("- the original"),
  new Connector("- the greatest"),
  new Connector("- the strongest"),
  new Connector("- the safest"),
  new Connector("the"),
  new SingleConnector("and"),
  new Leadin("This presentation has been brought to you by:"),
  new Leadin("By viewing this, you hereby surrender your soul to:"),
  new Leadin("This presentation has been approved by:"),
  new Leadin("This event is supported by:"),
  new Leadin("This event was made possible by our sponsors:"),
  new Leadin("If you liked this, thank:"),
  new Leadin("Do not forget to pledge your soul to our sponsors:"),
  new Leadin("Glory to our sponsors:"),
  new Leadin("Consider donating to our benefactors:"),
  new Leadin("We are unworthy of this joy. Let us thank our rulers:"),
  new Leadin("Give thanks to our overlords for this act of charity:"),
  new Terminator("and Sons"),
  new Terminator("Professionals"),
  new Terminator("Co."),
  new Terminator("- A Family Company"),
];

exports.relevant_start_statuses = [
  'PLAYING',
  'WATCHING',
  'LISTENING',
  'COMPETING'
];