# AntiUptimeTwitchBot
A Twitch.tv chat bot for those who hate people using !uptime or messages like "How long have he streamed?"

It timeout detected users for as long as the stream have been going on!

So if the channel have been live for 3 hours, the user gets a 3 hours timeout!

## Requirements
* [Node.JS](https://nodejs.org/download/)

## Install
Run `npm install` in console to install dependency modules.
Copy or rename `config.sample.json` to `config.json` and modify the content to your liking.
Start the bot by running `node start` in console.

## Config
* **debug**
Activate debug mode to get messages of what the bot does.
* **debugIgnore**
Decide what you don't want to know from the bot.
Valid options is *connected*, *join*, *left*, *update*, *incoming*, *timeout* and *error*
* **experimental**
Activate the experimental mode that detects messages such as "How long have he streamed?" and "How long has you been live?"
If this is deactivated, the bot only detects "!uptime"
* **extraPronoun**
Add other pronouns the experimental mode will detect.
If your nickname is MAN, then set this to "|man" and it will also detect "How long have MAN been live?"
* **username**
The bot's username.
* **password**
The bot's oauth password.
You can get it [here](http://twitchapps.com/tmi/) by connecting with your Twitch Account.
* **channel**
The channel the bot shall join.