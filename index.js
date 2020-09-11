const Discord = require("discord.js")
var admin = require("firebase-admin")

var MapgameBotUtilFunctions = require("./MapgameBotUtilFunctions")
var RegisterNation = require("./RegisterNation")
var ApplicationManagement = require("./ApplicationManagement")
var MapHelper = require("./MapHelper")
var NationManager = require("./NationManager")

class MapgameClient {
    constructor(discordBotToken, pathToFirebaseToken) {
        this.discordClient = new Discord.Client()

        admin.initializeApp({
            credential: admin.credential.cert(pathToFirebaseToken),
            databaseURL: "https://mapgame-discord-bot.firebaseio.com/"
        })
        this.db = admin.database()

        this.discordClient.on("ready", () => {
            console.log(`Logged in as ${this.discordClient.user.tag}`)

            this.discordClient.guilds.cache.array().forEach(guild => {
                RegisterNation.setupFirebaseValueChecksForNationApplicationsAndNationCreation(this.db, this.discordClient, guild.id, new MapgameBotUtilFunctions(this.discordClient))
            });
        })

        this.discordClient.on("guildCreate", guild => {
            var defaultChannel = "";
            guild.channels.cache.array().forEach(channel => {
                if (channel.type == "text" && defaultChannel == "") {
                    if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                        defaultChannel = channel;
                    }
                }
            })

            defaultChannel.send("Hello! To start linking your server with the bot and website, type \"" + config.prefix + "init\". Also, make sure to have my role (which should be 'Mapgame Bot') at the top of your server's role list in your server's settings or else I won't work!")
        })

        this.discordClient.login(discordBotToken)
    }
}

exports.MapgameClient = MapgameClient
exports.MapgameBotUtilFunctions = MapgameBotUtilFunctions
exports.RegisterNation = RegisterNation
exports.ApplicationManagement = ApplicationManagement
exports.MapHelper = MapHelper
exports.NationManager = NationManager