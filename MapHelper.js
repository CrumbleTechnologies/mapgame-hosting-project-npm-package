class MapHelper {
    static async makeMapClaim(db, guildID, nationID, mapClaimCode, mapgameBotUtilFunctions) {
        var status = ""
        await db.ref("discord-servers/" + guildID + "/nations/" + nationID).once("value", (snapshot) => {
            if (snapshot.val() == null) {
                status = "no-such-nation"
            } else {
                mapgameBotUtilFunctions.generateMapFromMapCode(mapClaimCode, true).then(mapPathAndNumberOfTiles => {
                    mapPath = mapPathAndNumberOfTiles[0]
                    numberOfTiles = mapPathAndNumberOfTiles[1]

                    // datetime format in database: yyyy/mm/dd/hh/MM

                    var dateTimeNow = new Date()
                    var dateTimeLast = new Date(snapshot.val().lastMapClaimTime.slice(0, 4), snapshot.val().lastMapClaimTime.slice(5, 7), snapshot.val().lastMapClaimTime.slice(8, 10), snapshot.val().lastMapClaimTime.slice(11, 13), snapshot.val().lastMapClaimTime.slice(14, 16))
                    var hoursDifference = Math.abs(dateTimeNow - dateTimeLast) / 36e5

                    db.ref("discord-servers/" + guildID + "/config/numberOfTilesToClaimEachDay").once("value", (snapshot2) => {
                        if (hoursDifference < 24) {
                            status = "map-claim-too-soon"
                        } else if (parseInt(numberOfTiles) > parseInt(snapshot2.val())) {
                            status = "too-many-tiles"
                        } else {
                            if (mapPath == "error parsing map code") {
                                status = "invalid-map-code"

                                return
                            } else {
                                var dateTimeNow = new Date()

                                console.log(`${dateTimeNow.getFullYear()}/${dateTimeNow.getMonth().toString().padStart(2, "0")}/${dateTimeNow.getDate().toString().padStart(2, "0")}/${dateTimeNow.getHours().toString().padStart(2, "0")}/${dateTimeNow.getMinutes().toString().padStart(2, "0")}`)
                                mapgameClient.db.ref("discord-servers/" + guildID + "/nations/" + msg.author.id).update({
                                    "mapClaimCode": snapshot.val().mapClaimCode + args[0],
                                    "lastMapClaimTime": `${dateTimeNow.getFullYear()}/${dateTimeNow.getMonth().toString().padStart(2, "0")}/${dateTimeNow.getDate().toString().padStart(2, "0")}/${dateTimeNow.getHours().toString().padStart(2, "0")}/${dateTimeNow.getMinutes().toString().padStart(2, "0")}`
                                }).then(() => {
                                    status = "success"
                                })
                            }
                        }
                    })
                })
            }
        })

        return status
    }
}

module.exports = MapHelper