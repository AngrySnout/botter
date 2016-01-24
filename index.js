var irc = require("irc");

function response(sender, params) {
	var res = sender + " is looking for ";
	res += params.type||"games";
	res += (params.server)? " on "+params.server+".": ".";
	return res;
}

function mix(sender, args) {
	return response(sender, { type: "mixed games", server: args.join(" ") });
}

function cw(sender, args) {
	var players = "",
		num = parseInt(args[0]);
	if (!isNaN(num)) {
		args = args.slice(1);
		players += num+"v"+num+" ";
	}
	return response(sender, { type: "a "+players+"clanwar", server: args.join(" ") });
}

function duel(sender, args) {
	var mode = "a ";
	if (args[0] && ["insta", "effic", "ffa"].indexOf(args[0].toLowerCase()) >= 0) {
		mode = args[0];
		mode = "an "+mode+" ";
		args = args.slice(1);
	}
	return response(sender, { type: mode+"duel", server: args.join(" ") });
}

function help() {
	return [
		"Commands:",
		" ^mix [server...]",
		" ^cw [number] [server...]",
		" ^duel [insta|effic|ffa] [server...]",
		" ^help"
	].join("\n");
}

var settings = {
	name: "botter",
	channels: [
		"#sauertracker" // the first channel is the one listened to
	],
	commandPrefix: "^",
	commands: {
		"mix": mix,
		"cw": cw,
		"duel": duel,
		"help": help
	}
};

var client = new irc.Client("irc.gamesurge.net", settings.name, {
	userName: settings.name,
    realName: settings.name,
    channels: settings.channels,
	autoRejoin: true,
    floodProtection: true
});

function splitArgs(text) {
	return text.replace(/[\n\r]/g, "").split(" ");
}

client.addListener('message', function (from, to, message) {
	var args = message.replace(/[\n\r]/g, "").split(" ");
	if (args[0][0] == settings.commandPrefix) {
		var command = args[0].slice(1);
		if (settings.commands[command]) client.say(settings.channels[0], settings.commands[command](from, args.slice(1)));
	}
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});
