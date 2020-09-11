class NationManager {
    constructor(db, guildID) {
        this.db = db
        this.guildID = guildID
        this.Discord = require("discord.js")
    }

    async getAllNationsEmbed(mapgameBotUtilFunctions) {
        var snapshot
        var embedToReturn = "embed"
        var listOfNationKeys = []
        await this.db.ref("discord-servers/" + this.guildID + "/nations").once("value").then((snapshot1) => {
            if (!snapshot1.exists()) {
                embedToReturn = "No nations created yet."
            } else {
                snapshot = snapshot1
            }
        })
        if (embedToReturn == "embed") {
            Object.keys(snapshot.val()).forEach(nationKey => {
                listOfNationKeys.push(nationKey)
            })
            var ref2 = this.db.ref("discord-servers/" + this.guildID + "/config/listOfFieldsForRegistration")

            await ref2.once("value").then((snapshot2) => {
                var nationsFieldValues = []
                listOfNationKeys.forEach(nationKey => {
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

        return embedToReturn
    }
}

module.exports = NationManager