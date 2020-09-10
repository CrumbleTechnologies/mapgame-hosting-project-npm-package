class NationManager {
    constructor(db, guildID) {
        this.db = db
        this.guildID = guildID
        this.Discord = require("discord.js")
    }

    async getAllNationsEmbed(mapgameBotUtilFunctions) {
        var embedToReturn = null
        var listOfNationKeys = []
        await this.db.ref("discord-servers/" + this.guildID + "/nations").once("value", (snapshot) => {
            if (!snapshot.exists()) {
                return
            } else {
                Object.keys(snapshot.val()).forEach(nationKey => {
                    listOfNationKeys.push(nationKey)
                })

                var ref2 = this.db.ref("discord-servers/" + this.guildID + "/config/listOfFieldsForRegistration")
                ref2.once("value", (snapshot2) => {
                    var nationsFieldValues = []
                    listOfNationsKeys.forEach(nationKey => {
                        var nationValueForField = ""
                        snapshot2.val().forEach(fieldName => {
                            nationValueForField += fieldName + ": " + snapshot.val()[nationKey].fields[fieldName] + "\n"
                        });

                        nationsFieldValues.push({
                            name: mapgameBotUtilFunctions.getUserFromMention("<@" + snapshot.child(nationKey).key + ">").username,
                            value: nationValueForField,
                            inline: true
                        })
                    });

                    console.log(nationsFieldValues)

                    var embed = new this.Discord.MessageEmbed()
                        .setTitle("List of Nations")
                        .setColor("#009900")
                        .addFields(nationsFieldValues)
                    embedToReturn = embed
                })
            }
        })

        return embedToReturn
    }
}

module.exports = NationManager