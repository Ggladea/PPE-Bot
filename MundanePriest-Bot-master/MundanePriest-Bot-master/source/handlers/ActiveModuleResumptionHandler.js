const Discord = require(`discord.js`)
const token = `secretTokenLanis5671`
const resumptionToken = `resumedVerificationLanis5671`

module.exports = class ActiveModuleResumptionHandler {

    /**
     * @param {Discord.Client} client The client that will have its modules resumed.
     */
    constructor(client) {
        this.client = client
    }

    async resumeModules() {
        this.Guilds = await this.client.database[`Guild`].findAll()
        await this.resumeGuildSetups()
        //await this.resumeSeasonSetups()
        await this.loadDMChannelsForInvites()
        await this.resumeItemSubmissions()
        await this.resumeTeamCreations()
        await this.resumeTeamKickPrompts()
        await this.resumeTeamInvitePrompts()
        await this.resumeVerifications()
    }

    async loadDMChannelsForInvites() {
        return new Promise(async resolve => {
            let resumedInviteListeners = 0
            const TeamInvites = await this.client.database[`TeamInvite`].findAll()

            for (const TeamInvite of TeamInvites) {
                const user = this.client.users.get(TeamInvite.recipientId)
                await user.createDM()
                resumedInviteListeners ++
            }

            if (resumedInviteListeners > 0) {
                console.log(`Listening to ${resumedInviteListeners} Old Team Invites.`)
            }

            resolve()
        })
    }

    async resumeItemSubmissions() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0

            for (const Guild of this.Guilds) {
                const ItemSubmissionDispenser = await Guild.getItemSubmissionDispenser()
                if (!ItemSubmissionDispenser) continue
                const ItemSubmissionPrompts = await ItemSubmissionDispenser.getItemSubmissionPrompts()

                for (const ItemSubmissionPrompt of ItemSubmissionPrompts) {
                    const author = this.client.users.get(ItemSubmissionPrompt.userId)
                    const channel = await author.createDM()
                    if (!channel) {
                        await ItemSubmissionPrompt.destroy()
                        continue
                    }

                    const message = await channel.messages.fetch(ItemSubmissionPrompt.messageId).catch(() => {
                        console.log(`Problem while fetching message for team creation resumption.`)
                    })

                    const guild = this.client.guilds.get(Guild.guildId)
                    if (!message || !author || !guild) {
                        await ItemSubmissionPrompt.destroy()
                        continue
                    }


                    const command = this.client.commands.get(`SUBMITITEM`)
                    if (command) {
                        command.run(this.client, author, guild, message, [token, resumptionToken])
                        resumedModuleCount += 1
                    }
                }
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Item Submission Prompts.`)
            }

            resolve()
        })
    }

    async resumeTeamCreations() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0

            for (const Guild of this.Guilds) {
                const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
                if (!TeamCreationDispenser) continue
                const TeamCreationPrompts = await TeamCreationDispenser.getTeamCreationPrompts()

                for (const TeamCreationPrompt of TeamCreationPrompts) {
                    const author = this.client.users.get(TeamCreationPrompt.userId)
                    const channel = await author.createDM()
                    if (!channel) {
                        await TeamCreationPrompt.destroy()
                        continue
                    }

                    const message = await channel.messages.fetch(TeamCreationPrompt.messageId).catch(() => {
                        console.log(`Problem while fetching message for team creation resumption.`)
                    })

                    const guild = this.client.guilds.get(Guild.guildId)
                    if (!message || !author || !guild) {
                        await TeamCreationPrompt.destroy()
                        continue
                    }


                    const command = this.client.commands.get(`CREATETEAM`)
                    if (command) {
                        command.run(this.client, author, guild, message, [token, resumptionToken])
                        resumedModuleCount += 1
                    }
                }
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Team Creation Prompts.`)
            }

            resolve()
        })
    }
    
    async resumeTeamKickPrompts() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0

            for (const Guild of this.Guilds) {
                const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
                if (!TeamCreationDispenser) continue
                const TeamKickPrompts = await TeamCreationDispenser.getTeamKickPrompts()

                for (const TeamKickPrompt of TeamKickPrompts) {
                    const author = this.client.users.get(TeamKickPrompt.userId)
                    const channel = await author.createDM()
                    if (!channel) {
                        await TeamKickPrompt.destroy()
                        continue
                    }

                    const message = await channel.messages.fetch(TeamKickPrompt.messageId).catch(() => {
                        console.log(`Problem while fetching message for team member kicking resumption.`)
                    })

                    const guild = this.client.guilds.get(Guild.guildId)
                    if (!message || !author || !guild) {
                        await TeamKickPrompt.destroy()
                        continue
                    }


                    const command = this.client.commands.get(`KICKTEAMMEMBER`)
                    if (command) {
                        command.run(this.client, author, guild, message, [token, resumptionToken])
                        resumedModuleCount += 1
                    }
                }
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Team Kick Prompts.`)
            }

            resolve()
        })
    }

    async resumeTeamInvitePrompts() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0

            for (const Guild of this.Guilds) {
                const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
                if (!TeamCreationDispenser) continue
                const TeamInvitationPrompt = await TeamCreationDispenser.getTeamInvitationPrompts()

                for (const TeamInvitePrompt of TeamInvitationPrompt) {
                    //module.exports.run = async (client, author, message, args) => {
                    const author = this.client.users.get(TeamInvitePrompt.userId)
                    const channel = await author.createDM()
                    if (!channel) {
                        await TeamInvitePrompt.destroy()
                        continue
                    }

                    const message = await channel.messages.fetch(TeamInvitePrompt.messageId).catch(() => {
                        console.log(`Problem while fetching message for team creation resumption.`)
                    })

                    const guild = this.client.guilds.get(Guild.guildId)
                    if (!message || !author || !guild) {
                        await TeamInvitePrompt.destroy()
                        continue
                    }


                    const command = this.client.commands.get(`INVITETOTEAM`)
                    if (command) {
                        command.run(this.client, author, guild, message, [token, resumptionToken])
                        resumedModuleCount += 1
                    }
                }
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Team Invitation Prompts.`)
            }

            resolve()
        })
    }

    async resumeGuildSetups() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0
            for (const Guild of this.Guilds) {
                const GuildSetupPrompt = await Guild.getGuildSetupPrompt()

                if (!GuildSetupPrompt) continue

                /**
                 * @param {Discord.TextChannel} channel The channel that the message was sent in.
                 * @param {Discord.Message} message The message that was sent.
                 */
                const channel = this.client.channels.get(GuildSetupPrompt.channelId)
                const message = await channel.messages.fetch(GuildSetupPrompt.messageId).catch(() => {
                    console.log(`Problem while fetching message for setup resumption.`)
                })

                if (!message) {
                    GuildSetupPrompt.destroy()
                    continue
                }

                const command = this.client.commands.get(`STARTSETUP`)
                command.run(this.client, message, [])
                resumedModuleCount += 1
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Setup Prompts.`)
            }

            resolve()
        })
    }

    async resumeVerifications() {
        return new Promise(async resolve => {
            let resumedModuleCount = 0
            for (const Guild of this.Guilds) {
                const VerificationDispenser = await Guild.getVerificationDispenser()
                if (!VerificationDispenser) continue

                const VerificationPrompts = await VerificationDispenser.getVerificationPrompts()
                for (const VerificationPrompt of VerificationPrompts) {
                    /**
                    * @param {Discord.TextChannel} channel The channel that the message was sent in.
                    * @param {Discord.Message} message The message that was sent.
                    * @param {Discord.GuildMember} author The user that is verifying
                    */
                    const channel = this.client.channels.get(VerificationPrompt.channelId)
                    const message = await channel.messages.fetch(VerificationPrompt.messageId).catch(() => {
                        console.log(`Problem while fetching message for verification resumption.`)
                    })

                    if (!message) {
                        await VerificationPrompt.destroy()
                        continue
                    }

                    const author = await channel.guild.members.fetch(VerificationPrompt.userId).catch(() => {
                        console.log(`Problem while fetching member for verification resumption.`)
                    })

                    if (!author) {
                        await VerificationPrompt.destroy()
                        continue
                    }

                    const command = this.client.commands.get(`VERIFY`)
                    command.run(this.client, author, message, [token, resumptionToken])
                    resumedModuleCount += 1
                }
            }

            if (resumedModuleCount > 0) {
                console.log(`Resumed ${resumedModuleCount} Verification Prompts.`)
            }

            resolve()
        })
    }
}