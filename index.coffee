require("source-map-support").install()
irc = require "irc"
request = require "request"
fuzzaldrin = require "fuzzaldrin"

serverList = []

updateServerList = ->
    request "http://uk.cube2.org/serverlist", (error, response, body) ->
        if !error && response.statusCode == 200 then serverList = JSON.parse(body)

updateServerList()
setInterval updateServerList, 30000

findServer = (query) ->
    candidates = fuzzaldrin.filter serverList, query, {key: 'description', maxResults: 5}
    if 0 < candidates.length < 5
        "#{candidates[0].description}: /connect #{candidates[0].host} #{candidates[0].port}"
    else
        query

response = (sender, type = "games", server) ->
    "#{sender} is looking for #{type}#{if server then ' on '+server else '.'}"

name = "botter"
prefix = "."
channels = ["#botter_test"]
commands =
    mix: (sender, args) ->
        [response(sender, "mixed games", findServer args.join " "), true]
    cw: (sender, args) ->
        players = ""
        unless isNaN (num = parseInt args[0])
            players = "#{num}v#{num} "
            args = args.slice 1
        [response(sender, "a #{players}clanwar", findServer args.join " "), true]
    duel: (sender, args) ->
        mode = "a "
        if args[0] in ["insta", "effic", "ffa"]
            mode = "#{if args[0][0] == 'f' then 'a' else 'an'} #{args[0]} "
            args = args.slice 1
        [response(sender, "#{mode}duel", findServer args.join " "), true]
    help: ->
        ["Commands: #{prefix}mix [server...], #{prefix}cw [number] [server...], #{prefix}duel [insta|effic|ffa] [server...], #{prefix}help, #{prefix}about", false]
    about: ->
        ["botter; a bottie replacement. https://github.com/AngrySnout/botter", false]

client = new irc.Client "burstfire.uk.eu.gamesurge.net", name,
    userName: name
    realName: name
    channels: channels
    autoRejoin: true
    floodProtection: true

splitArgs = (text) ->
    text.replace(/[\n\r]/g, "").split(" ")

client.addListener 'message', (from, to, message) ->
    args = splitArgs message
    if args[0][0] == prefix
        command = args[0].slice 1
        if commands[command]
            [res, announce] = commands[command](from, args.slice 1)
            if announce
                client.say chan, res for chan in channels
            else
                client.send "notice", from, res

client.addListener "error", (message) ->
    console.log "error: ", message
