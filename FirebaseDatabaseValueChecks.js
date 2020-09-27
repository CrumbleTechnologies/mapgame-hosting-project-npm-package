class FirebaseDatabaseValueChecks {
    static setupChecksForNationApplicationsAndNationCreation(db, client, guildID, mapgameBotUtilFunctions) {
        const Discord = require("discord.js")
        var ref = db.ref("discord-servers/" + guildID + "/nationApplications")
        ref.once("value", (snapshot) => {
            if (!snapshot.exists()) {
                return
            }
            Object.keys(snapshot.val()).forEach(userID => { // Object.keys only returns first level keys, no recursion
                db.ref("discord-servers/" + guildID + "/nationApplications/" + userID + "/status").on("value", (snapshot) => {
                    switch (snapshot.val()) {
                        case "accepted":
                            client.users.cache.get(userID).send("Your nation application for the server \"" + client.guilds.cache.get(guildID).name + "\" has been accepted!")

                            db.ref("discord-servers/" + guildID + "/config").once("value", (snapshot1) => {
                                db.ref("discord-servers/" + guildID + "/nationApplications/" + userID).once("value", (snapshot2) => {
                                    db.ref("discord-servers/" + guildID + "/nations/" + userID + "/status").once("value", (snapshot3) => {
                                        if (snapshot3.val() == "active") {
                                            return
                                        }
                                        if (snapshot1.val().nicknameTemplate) {
                                            try {
                                                client.guilds.cache.get(guildID).members.cache.get(userID).setNickname(mapgameBotUtilFunctions.replaceTemplateWithFieldValues(snapshot1.val().nicknameTemplate, snapshot1.val().listOfFieldsForRegistration, snapshot2.val().fields)).catch(error => console.log(error))
                                            } catch {}
                                        }
                                        if (snapshot1.val().channelTemplate) {
                                            var channelName = mapgameBotUtilFunctions.replaceTemplateWithFieldValues(snapshot1.val().channelTemplate, snapshot1.val().listOfFieldsForRegistration, snapshot2.val().fields)
                                            client.guilds.cache.get(guildID).channels.create(channelName).then(channel => {
                                                channel.setParent(client.guilds.cache.get(guildID).channels.cache.get(snapshot1.val().categoryToAddNationChannelsToID))

                                                var nationEmbed = new Discord.MessageEmbed()
                                                    .setTitle("Owner: " + client.users.cache.get(userID).username + "#" + client.users.cache.get(userID).discriminator)
                                                snapshot1.val().listOfFieldsForRegistration.forEach(fieldName => {
                                                    nationEmbed.addField(fieldName, snapshot2.val().fields[fieldName])
                                                });
                                                mapgameBotUtilFunctions.generateMapFromMapCode(snapshot2.val().mapClaimCode).then((mapPath) => {
                                                    if (snapshot1.val().customOrIrlNation == "custom") {
                                                        nationEmbed.addField("Map Claim", "See attached image")

                                                        nationEmbed.files.push(mapPath)
                                                    }

                                                    channel.send(nationEmbed)
                                                })
                                            })
                                        }

                                        db.ref("discord-servers/" + guildID + "/nations").update({
                                            [userID]: snapshot2.val()
                                        })

                                        db.ref("discord-servers/" + guildID + "/nations/" + userID + "/status").set("active")
                                    })
                                })
                            })
                            break;

                        case "pendingApproval":
                            // do nothing
                            break;

                        case "cancelled":
                            // do nothing
                            break;

                        case "rejected":
                            client.users.cache.find(user => user.id === userID).send("Your nation application for the server \"" + client.guilds.cache.get(guildID).name + "\" has been rejected.")
                            break;

                        default:
                            break;
                    }
                })
            })
        })
    }
}

module.exports = FirebaseDatabaseValueChecks