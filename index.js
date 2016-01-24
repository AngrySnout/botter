var irc = require("irc");
var request = require("request");
var fuzzaldrin = require("fuzzaldrin");

var serverList = [];

function updateServerList() {
	request("http://uk.cube2.org/serverlist", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			serverList = JSON.parse(body);
		}
	});
}
updateServerList();
setInterval(updateServerList, 30000);

function findServer(query) {
	var candidates = fuzzaldrin.filter(serverList, query, { key: 'description', maxResults: 5 });
	if (candidates.length == 5 || candidates.length === 0) return "\x02"+query+"\x0F";
	return "\x02"+candidates[0].description+"\x0F ( \x0303/connect "+candidates[0].host+" "+candidates[0].port+"\x0F )";
}

function response(sender, params) {
	var res = sender + " is looking for ";
	res += params.type||"games";
	res += (params.server)? " on "+params.server+".": ".";
	return res;
}

function mix(sender, args) {
	return response(sender, { type: "mixed games", server: findServer(args.join(" ")) });
}

function cw(sender, args) {
	var players = "",
		num = parseInt(args[0]);
	if (!isNaN(num)) {
		args = args.slice(1);
		players += num+"v"+num+" ";
	}
	return response(sender, { type: "a "+players+"clanwar", server: findServer(args.join(" ")) });
}

function duel(sender, args) {
	var mode = "a ";
	if (args[0] && ["insta", "effic", "ffa"].indexOf(args[0].toLowerCase()) >= 0) {
		mode = args[0];
		mode = "an "+mode+" ";
		args = args.slice(1);
	}
	return response(sender, { type: mode+"duel", server: findServer(args.join(" ")) });
}

function help() {
	return "\x02Commands:\x0F \x0306^mix [server...]\x0F, \x0306^cw [number] [server...]\x0F,\x0306^duel [insta|effic|ffa] [server...]\x0F, \x0306^help\x0F, \x0306^about";
}

function about() {
	return "\x02\x0305botter\x0F; a bottie replacement. https://github.com/AngrySnout/botter";
}

var settings = {
	name: "botter",
	channels: [
		"#sauercom"
	],
	commandPrefix: "^",
	commands: {
		"mix": mix,
		"cw": cw,
		"duel": duel,
		"help": help,
		"about": about
	}
};

var client = new irc.Client("burstfire.uk.eu.gamesurge.net", settings.name, {
	userName: settings.name,
    realName: settings.name,
    channels: settings.channels,
	autoRejoin: true,
    floodProtection: true
});

function splitArgs(text) {
	return text.replace(/[\n\r]/g, "").split(" ");
}

client.addListener("message", function (from, to, message) {
	var args = message.replace(/[\n\r]/g, "").split(" ");
	if (args[0][0] == settings.commandPrefix) {
		var command = args[0].slice(1);
		if (settings.commands[command]) {
			var res = settings.commands[command](from, args.slice(1));
			for (var chan in settings.channels) {
				client.say(settings.channels[chan], res);
			}
		}
	}
});

client.addListener("error", function(message) {
    console.log("error: ", message);
});
