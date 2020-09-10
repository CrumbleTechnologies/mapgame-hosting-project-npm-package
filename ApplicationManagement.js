class ApplicationManagement {
    static async acceptApplication(db, guildID, applicationID) {
        var status = ""
        await db.ref("discord-servers/" + guildID + "/nationApplications/" + applicationID).once("value", (snapshot) => {
            if (snapshot.val() == null) {
                status = "no-such-nation"
            } else {
                db.ref("discord-servers/" + guildID + "/nationApplications/" + applicationID).update({
                    "status": "accepted"
                })
                status = "success"
            }
        })

        return status
    }

    static async rejectApplication(db, guildID, applicationID) {
        var status = ""
        await db.ref("discord-servers/" + guildID + "/nationApplications/" + applicationID).once("value", (snapshot) => {
            if (snapshot.val() == null) {
                status = "no-such-nation"
            } else {
                db.ref("discord-servers/" + guildID + "/nationApplications/" + applicationID).update({
                    "status": "rejected"
                })
                status = "success"
            }
        })

        return status
    }
}

module.exports = ApplicationManagement