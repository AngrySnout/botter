var channels, client, commands, findServer, fuzzaldrin, irc, name, prefix, request, response, serverList, updateServerList;

require("source-map-support").install();

irc = require("irc");

request = require("request");

fuzzaldrin = require("fuzzaldrin");

serverList = [];

updateServerList = function() {
  return request("http://uk.cube2.org/serverlist", function(error, response, body) {
    if (!error && response.statusCode === 200) {
      return serverList = JSON.parse(body);
    }
  });
};

updateServerList();

setInterval(updateServerList, 30000);

findServer = function(query) {
  var candidates, ref;
  candidates = fuzzaldrin.filter(serverList, query, {
    key: 'description',
    maxResults: 5
  });
  if ((0 < (ref = candidates.length) && ref < 5)) {
    return candidates[0].description + ": /connect " + candidates[0].host + " " + candidates[0].port;
  } else {
    return query;
  }
};

response = function(sender, type, server) {
  if (type == null) {
    type = "games";
  }
  return sender + " is looking for " + type + (server ? ' on ' + server : '.');
};

name = "botter";

prefix = ".";

channels = ["#botter_test"];

commands = {
  mix: function(sender, args) {
    return [response(sender, "mixed games", findServer(args.join(" "))), true];
  },
  cw: function(sender, args) {
    var num, players;
    players = "";
    if (!isNaN((num = parseInt(args[0])))) {
      players = num + "v" + num + " ";
      args = args.slice(1);
    }
    return [response(sender, "a " + players + "clanwar", findServer(args.join(" "))), true];
  },
  duel: function(sender, args) {
    var mode, ref;
    mode = "a ";
    if ((ref = args[0]) === "insta" || ref === "effic" || ref === "ffa") {
      mode = (args[0][0] === 'f' ? 'a' : 'an') + " " + args[0] + " ";
      args = args.slice(1);
    }
    return [response(sender, mode + "duel", findServer(args.join(" "))), true];
  },
  help: function() {
    return ["Commands: " + prefix + "mix [server...], " + prefix + "cw [number] [server...], " + prefix + "duel [insta|effic|ffa] [server...], " + prefix + "help, " + prefix + "about", false];
  },
  about: function() {
    return ["botter; a bottie replacement. https://github.com/AngrySnout/botter", false];
  }
};

client = new irc.Client("burstfire.uk.eu.gamesurge.net", name, {
  userName: name,
  realName: name,
  channels: channels,
  autoRejoin: true,
  floodProtection: true
});

client.addListener('message', function(from, to, message) {
  var announce, args, chan, command, i, len, ref, res, results;
  args = message.replace(/[\n\r]/g, "").split(" ");
  if (args[0][0] === prefix && (command = args[0].slice(1)) in commands) {
    ref = commands[command](from, args.slice(1)), res = ref[0], announce = ref[1];
    if (announce) {
      results = [];
      for (i = 0, len = channels.length; i < len; i++) {
        chan = channels[i];
        results.push(client.say(chan, res));
      }
      return results;
    } else {
      return client.send("notice", from, res);
    }
  }
});

client.addListener("error", function(message) {
  return console.log("error: ", message);
});

//# sourceMappingURL=index.js.map
