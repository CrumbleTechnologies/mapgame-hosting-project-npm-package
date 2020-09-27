const Discord = require("discord.js")
var admin = require("firebase-admin")

var MapgameBotUtilFunctions = require("./MapgameBotUtilFunctions")
var FirebaseDatabaseValueChecks = require("./FirebaseDatabaseValueChecks")
var ApplicationManagement = require("./ApplicationManagement")
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

            this.db.ref("list-of-mapgame-ids").on("value", (snapshot) => {
                snapshot.val().forEach(guildID => {
                    this.db.ref("discord-servers/" + guildID + "/config/categoryToAddNationChannelsToID").on("value", (snapshot2) => {
                        try {
                            this.discordClient.guilds.cache.get(guildID).channels.cache.get(snapshot2.val()).updateOverwrite(this.discordClient.user, { MANAGE_CHANNELS: true })
                        } catch {}
                    })
                    FirebaseDatabaseValueChecks.setupChecksForNationApplicationsAndNationCreation(this.db, this.discordClient, guildID, new MapgameBotUtilFunctions(this.discordClient))
                        // TODO: firebase checks for map claims to send world map
                });
            })
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
exports.FirebaseDatabaseValueChecks = FirebaseDatabaseValueChecks
exports.ApplicationManagement = ApplicationManagement
exports.NationManager = NationManager