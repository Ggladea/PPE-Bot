const DatabaseHandlerModule = require(`./DatabaseHandler`)
const Discord = require(`discord.js`)

/** Guild Join Event Handler */
module.exports = class SweepingHandler {
    constructor(client) {
        this.client = client
    }

    /**
     * @function sweep Sweeps all the possible modules the bot stores for its usage, Mod Mail Dispensers, Role Dispensers, Verification Dispensers and Guilds.
     */
    async sweep() {
        await this.checkForNewGuilds()
        await this.sweepPendingItemSubmissions()
       // await this.sweepVerificationDispensers()
    }


    async sweepPendingItemSubmissions() {
        return new Promise(async resolve => {
            let sweepedPendingSubmissionCount = 0

            const Guilds = await this.client.database[`Guild`].findAll()
            for (const Guild of Guilds) {
                const ItemSubmissionDispenser = await Guild.getItemSubmissionDispenser()
                if (ItemSubmissionDispenser) {
                    const PendingItemSubmissions = await ItemSubmissionDispenser.getPendingItemSubmissionPrompts()
                    for (const PendingItemSubmission of PendingItemSubmissions) {
                        const channel = this.client.channels.get(PendingItemSubmission.channelId)
                        const message = await channel.messages.fetch(PendingItemSubmission.messageId).catch(() => {/** Ignore */})
                        const user = this.client.users.get(PendingItemSubmission.userId)

                        if (!channel || !message) {
                            if (user) {
                                const pendingItemSubmissionSweepedEmbed = new Discord.MessageEmbed()
                                    .addField(`Submission Deleted`, `Your submission was lost in the great spaces of the Internet! The **${PendingItemSubmission.itemLongName}** submission has been deleted and you have received no points for it. Please submit it again and sorry for any inconveniences.`)
                                    .setColor(this.client.color)
                                
                                await user.send(pendingItemSubmissionSweepedEmbed).catch(() => {/** Ignore */})
                            }

                            await PendingItemSubmission.destroy()
                            sweepedPendingSubmissionCount ++
                        }
                    }
                } else {
                    continue
                }
            }
        
            if (sweepedPendingSubmissionCount > 0) {
                console.log(`Sweeped ${sweepedPendingSubmissionCount} Pending Item Submissions.`)
            }

            resolve()
        })
    }

    /**
     * @function sweepVerificationDispensers Checks all stored verification dispensers, if the message is failed to fetch, the guild owner is informed and then it's removed from the memory.
     */
    async sweepVerificationDispensers() {
        return new Promise(async resolve => {
            let sweepedDispenserCount = 0

           // const Guild = await
            const verificationDispensers = await this.client.database[``].findAll()
            for (const verificationDispenser of verificationDispensers) {
                let isActive = true
                const guild = this.client.guilds.get(verificationDispenser.guildID)
                if (guild) {
                    const channel = guild.channels.get(verificationDispenser.channelID)
                    if (channel) {
                        const message = await channel.messages.fetch(verificationDispenser.messageID).catch()
                        if (!message) {
                            isActive = false
                            guild.owner.send(`It seems like the verification dispenser message has been deleted, it has been removed from memory and you will have to set it up again.`)
                        }
                    } else {
                        isActive = false
                    }
                } else {
                    isActive = false
                }

                if (!isActive) {
                    await this.client.database[`verificationDispensers`].destroy({ where: { guildID: verificationDispenser.guildID } })
                    sweepedDispenserCount += 1
                }
            }

            console.log(`Total Verification Dispensers ${verificationDispensers.length - sweepedDispenserCount} | Sweeped ${sweepedDispenserCount} dispensers | Total ${verificationDispensers.length}`)
            resolve()
        })
    }

    /**
     * @function checkForNewGuilds Checks for new guilds, if any are found and are not in memory, they are then added to memory.
     */
    async checkForNewGuilds() {
        return new Promise(async resolve => {
            let guildCount = this.client.guilds.size
            let oldGuildCount = 0
            let newGuildCount = 0

            for (const guild of this.client.guilds.values()) {
                const DatabaseHandler = new DatabaseHandlerModule(this.client, guild)
                await DatabaseHandler.isCreated().then(async exists => {
                    if (!exists) {
                        await DatabaseHandler.createDatabaseEntry()
                        newGuildCount += 1
                    } else {
                        oldGuildCount += 1
                    }

                    const Guild = await this.client.database[`Guild`].findOne({ where: { guildId: guild.id } })
                    const newMemberCount = await this.checkForNewMembersIn(Guild)

                    if (newMemberCount > 0) {
                        console.log(`${newMemberCount} new members in ${guild.name}.`)
                    }
                })
            }

            console.log(`Total Guilds ${guildCount} | Old ${oldGuildCount} | New ${newGuildCount}.`)
            resolve()
        })
    }

    async checkForNewMembersIn(Guild) {
        return new Promise(async resolve => {
            const guild = this.client.guilds.get(Guild.guildId)
            await guild.members.fetch()
            let usersCreated = 0

            for (const member of guild.members.values()) {
                const User = await Guild.getUsers({ where: { userId: member.id } })

                if (User.length === 0) {
                    await Guild.createUser({
                        userId: member.id
                    })

                    usersCreated += 1
                }
            }

            resolve(usersCreated)
        })
    }
}