# wise-garbage-can
Pointless bot built off discord.js that does a variety of not-even-remotely-related things. Created for personal use in a couple of small servers.

### Getting it Running

This is setup to work with Heroku, though it shouldn't be difficult to get it to work locally on its own. index.js just needs to be set to grab env variables from some place other than .env

To work, it needs to get a bot token to login with and a prefix to look for to indicate a command is being used. This would be a .env file if running on Heroku, or some config file otherwise. No .env file is included here for obvious security reasons

The .env file to get it to work with Heroku just needs to exist in the same directory as index.js and contain: <br>
BOT_TOKEN="token-used-to-login-here" <br>
CMD_PREFIX="!" (or any other desired command prefix) <br>
ENV="test" (case insensitive indicator of environment. One of 'prod' or 'test')

After installing dependencies via npm install:
~~~
heroku local
~~~
if the Heroku CLI is installed
or just
~~~
npm start
~~~
otherwise
