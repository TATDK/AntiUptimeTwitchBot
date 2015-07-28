var config = require('./config');

var irc = require('twitch-irc');
var CronJob = require('cron').CronJob;
var request = require('request');

var channelInfo = {};

var re = new RegExp('how long (have|has)([a-z\.?,\s]+)?(you|he' + (config.extraPronoun != null ? config.extraPronoun : '') + ')([a-z\.?,\s]+)?(been live|streamed|streaming)([a-z\.?,\s]+)?\?$', 'gi');

var twitchClient = new irc.client({
    options: {
        debug: false
    },
    connection: {
        serverType: 'chat'
    },
    identity: {
        username: config.username,
        password: config.password
    },
    channels: [config.channel]
});

twitchClient.connect();

twitchClient.addListener('connected', function () {
    if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('connected') < 0)) {
        console.log('[CHAT]      Connected');
    }
});

twitchClient.addListener('join', function (channel, username) {
    if (username.toLowerCase() == config.username.toLowerCase()) {
        if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('join') < 0)) {
            console.log('[JOIN]      #' + channel);
        }

        function cronjobCallback() {
            request({
                url: 'https://api.twitch.tv/kraken/streams/' + channel,
                encoding: 'utf8',
                json: true
            }, function (err, res, body) {
                if (res ? res.statusCode : -1 === 200) {
                    if (body['stream'] == null) {
                        channelInfo[channel].startTime = new Date(body['stream']['created_at']);
                    } else {
                        channelInfo[channel].startTime = null;
                    }

                    if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('update') < 0)) {
                        console.log('[UPDATE]    Updated stream start time for #' + channel + ' (' + (channelInfo[channel].startTime != null ? channelInfo[channel].startTime : 'Offline'));
                    }
                }
            });
        }

        channelInfo[channel] = {
            startTime: null,
            cronjob: new CronJob('0 */2 * * * *', cronjobCallback)
        };

        cronjobCallback();
    }
});

twitchClient.addListener('part', function (channel, username) {
    if (username.toLowerCase() == config.username.toLowerCase()) {
        if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('left') < 0)) {
            console.log('[LEFT]      #' + channel);
        }

        if (channelInfo[channel] != null) {
            channelInfo[channel].cronjob.stop();
        }
    }
});

twitchClient.addListener('chat', function (channel, user, message) {
    if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('incoming') < 0)) {
        var spaces = '';

        for (var i = user.username.length; i < 20; i++) {
            spaces += ' ';
        }

        console.log('[INCOMING]  ' + user.username + spaces + message);
    }

    if (twitchClient.isMod(channel, config.username)) {
        if (!twitchClient.isMod(channel, user.username)) {
            if (message.toLowerCase() === '!uptime' || (config.experimental && re.test(message))) {
                var time = channelInfo[channel] == null || channelInfo[channel].startTime == null ? 1 : Math.ceil((new Date() - channelInfo[channel].startTime) / 1000);
                twitchClient(channel, user.username, time);
                if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('timeout') < 0)) {
                    console.log('[TIMEOUT]   ' + user.username + ' (' + time + ' second' + (time != 1 ? 's' : ''));
                }
            }
        } else {
            if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('error') < 0)) {
                console.log('[ERROR]     User is a moderator');
            }
        }
    } else {
        if (config.debug && (config.debugIgnore == null || config.debugIgnore.indexOf('error') < 0)) {
            console.log('[ERROR]     Not a moderator');
        }
    }
});