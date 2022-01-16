# wise-garbage-can
Pointless bot built off [discord.js](https://discordjs.guide/) that does a variety of not-even-remotely-related things. Created for personal use in a couple of small servers.

### Getting it Running

The setup assumes that it is working with Heroku, though it shouldn't be difficult to get it to work locally on its own.

A couple of extra pieces of information need to be provided in order for the bot to work properly. This would be a .env file if running with Heroku, or some config file otherwise. No .env file is included here for obvious security reasons.

### Environment Variables in more detail

If running using Heroku, then there just needs to be an .env file added in the same directory as app.js with the following information. If running without heroku The app will have to be changed to fetch this information from a config file instead of expecting them to be set as env variables. <br>

- `BOT_TOKEN="token-used-to-login-here"` (the token to authenticate with. Can be obtained from the developer portal page for a bot application you created under "token") <br>
- `CLIENT_ID="your-application-id-here"` (the client id that is used when registering slash commands globally. Can also be obtained from the discord developer portal page for an application under "application id") <br>
- `GUILD_ID="your-guild-id-here"` (guild id used when registering slash commands for a single server. For testing locally: slash commands will update immediately when registered to a single guild, unlike global registration where changes can take time to fan out. If this is set, then CLIENT_ID is ignored and commands *will not be set globally*. Can be obtained by right clicking a server in discord while in developer mode > copy id)<br>
- `LOGGING_LEVEL=['verbose'|'standard']` (verbose has detailed debug logging, standard only logs severe errors)
- `CMD_PREFIX="!"` (or any other desired command prefix - **No longer used as of the discord v13 update** The existence of the officially supported slash command method of interacting with bots means that it is no longer necessary to have a prefix to indicate bot interactions)<br>

### Running locally

After installing the Heroku CLI and installing dependencies via npm install: `heroku local`. 
When running in a new server locally it may also be necessary to run `heroku release` in order to register slash commands so that they will actually appear when '/' is typed. 

It is not necessary to register slash commands every time the app is brought up - only if changes have been made to available slash commands or the bot has been added to a new server for local testing. On Heroku the commands are re-registered globally every time there is a new build.

### Running locally with a config file  

If running using a config file without Heroku: `npm start`

`node cmdregist.js` is the equivalent in this case to `heroku release` and is in fact what `release` does under the hood anyway.

### Unit Tests

There are some basic unit tests using mocha that can be run using npm test.
