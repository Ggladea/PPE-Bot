const Discord = require(`discord.js`)

const checkmarkEmoji = `✅`
const emailEmoji = `📧`

const destroyLeaveEmoji = `❌`
const keyEmoji = `🔑`
const kickTeammateEmoji = `👢`
const lockEmoji = `🔒`
const matchmakingToggleEmoji = `📂`
const matchmakingEmoji = `👀`
const invitationEmoji = `📧`
const itemSubmissionEmoji = `📬`
const teamCreationEmoji = `🛠`

const token = `secretTokenLanis5671` //also found in all 'botExclusive' commands

/** Guild Join Event Handler */
module.exports = class ReactionHandler {

    /** 
     * Handles the guild join event.
     * @param {Discord.Client} client The client that will handle the message.
     * @param {Discord.MessageReaction} messageReaction The guild that the bot joins.
     * @param {Discord.User} user The user who reacted to the message.
     * @param {Boolean} isAdded Whether the reaction was added.
    */
    async handleReaction(client, messageReaction, user, isAdded) {
        this.client = client
        this.messageReaction = messageReaction
        this.isAdded = isAdded
        this.user = user

        this.channel = messageReaction.message.channel
        this.guild = messageReaction.message.guild
        this.message = messageReaction.message

        //if not from a DM channel
        if (this.guild) {
            this.Guild = await this.client.database[`Guild`].findOne({ where: { guildID: this.guild.id } })

            if (!this.client.isReady) return

            if (this.channel.id === this.Guild.classDispenserChannelId) {
                const ClassRoleDispenser = await this.Guild.getClassRoleDispenser()
                if (ClassRoleDispenser) {
                    if (this.message.id === ClassRoleDispenser.messageId) {
                        this.handleClassReaction(ClassRoleDispenser)
                        return
                    }
                }
            }

            //On reaction added from here on out, ignore reaction remove.
            if (!this.isAdded) return

            if (this.channel.id === this.Guild.itemSubmissionDispenserChannelId) {
                const ItemSubmissionDispenser = await this.Guild.getItemSubmissionDispenser()
                if (ItemSubmissionDispenser) {
                    if (this.message.id === ItemSubmissionDispenser.messageId) {
                        this.handleItemSubmissionReaction(ItemSubmissionDispenser)
                    }
                }
            }

            if (this.channel.id === this.Guild.itemSubmissionsChannelId) {
                const ItemSubmissionDispenser = await this.Guild.getItemSubmissionDispenser()
                if (ItemSubmissionDispenser) {
                    const [PendingItemSubmissionPrompt] = await ItemSubmissionDispenser.getPendingItemSubmissionPrompts({ where: { messageId: this.message.id } })
                    if (PendingItemSubmissionPrompt) {
                        this.handlePendingItemSubmissionReaction()
                    }
                }
            }

            if (this.channel.id === this.Guild.teamCreationDispenserChannelId) {
                const TeamCreationDispenser = await this.Guild.getTeamCreationDispenser()
                if (TeamCreationDispenser) {
                    if (this.message.id === TeamCreationDispenser.messageId) {
                        this.handleTeamReaction()
                    }
                }
            }

            if (this.channel.id === this.Guild.verificationDispenserChannelId) {
                const VerificationDispenser = await this.Guild.getVerificationDispenser()
                if (VerificationDispenser) {
                    if (this.message.id === VerificationDispenser.messageId) {
                        this.handleVerificationReaction()
                        return
                    }
                }
            }
        } else {
            if (!this.isAdded) return

            if (this.channel.type === "dm") {
                const TeamInvitation = await this.client.database[`TeamInvite`].findOne({ where: { messageId: this.message.id } })
                if (TeamInvitation) {
                    this.handleTeamInvitationReaction()
                    return
                }
            }
        }
    }

    async handleClassReaction(ClassRoleDispenser) {
        const emojiReactionId = this.messageReaction.emoji.id
        const [Class] = await ClassRoleDispenser.getClasses({ where: { emojiId: emojiReactionId } })
        const Seasons = await this.Guild.getSeasons()
        const Season = Seasons.pop()
        const [User] = await this.Guild.getUsers({ where: { userId: this.user.id } })

        if (!Season || !Season.isStarted) {
            this.user.send(`No season is setup, I don't know whether you can have this class.`)

            return
        }

        if (Season.teamsEnabled) {
            if (User.teamId && this.isAdded && !User.className) {
                const Team = await this.client.database[`Team`].findOne({ where: { index: User.teamId } })
                const TeamMembers = await this.Guild.getUsers({ where: { teamId: Team.index } })
                const teamClasses = TeamMembers.map(TeamMember => {
                    if (TeamMember.class) {
                        return TeamMember.class
                    }
                })

                const classesObject = JSON.parse(Season.classPairs)
                const classes = Object.keys(classesObject).map(key => {
                    return classesObject[key]
                })

                for (const classPair of classes) {
                    if (classPair.includes(Class.name)) {
                        classPair.remove(Class.name)
                    }
                }

                for (const teammateClass of teamClasses) {
                    for (const classPair of classes) {
                        if (classPair.includes(teammateClass)) {
                            classPair.remove(teammateClass)
                        }
                    }
                }

                let emptyPairs = 0
                for (const classPair of classes) {
                    if (classPair.length === 0) {
                        emptyPairs += 1
                    }
                }

                let invalidComposition = false
                for (const TeamMember of TeamMembers) {
                    if (Class.name === TeamMember.className) {
                        invalidComposition = true
                        break
                    }
                }

                //even member count, one invalid pair will be a no no
                if (Season.maxMemberCount % 2 == 0) {
                    if (emptyPairs > 0) {
                        invalidComposition = true
                    }
                } else {
                    //if the pair that only has one class is left alone, that is an invalid composition
                    // {Class, Class}
                    // {  } <- error would be here
                    // { Class } <- solo pair left, not good.
                    let isSoloPairLeft = false
                    if (classes[Object.keys(classes).length - 1].length === 1) {
                        isSoloPairLeft = true
                    }

                    if (isSoloPairLeft && emptyPairs > 0) {
                        invalidComposition = true
                    } else if (!isSoloPairLeft && emptyPairs > 1) {
                        invalidComposition = true
                    }
                }

                if (invalidComposition) {
                    const invalidCompositionEmbed = new Discord.MessageEmbed()
                        .addField(`Error`, `If you switched to this class, your team would have an invalid composition.\nTo fix this change your class accordingly.`)
                        .setColor(this.client.color)

                    await this.user.send(invalidCompositionEmbed)
                    return
                }
            }
        }

        if (this.isAdded) {
            if (User.className) {
                const classAlreadyGivenEmbed = new Discord.MessageEmbed()
                    .addField(`Error`, `You already have a class, cannot give you a 2nd one.`)
                    .setColor(this.client.color)

                this.user.send(classAlreadyGivenEmbed)
                return
            }

            await User.update({
                className: Class.name
            })

            const classGivenEmbed = new Discord.MessageEmbed()
                .addField(`Success`, `Your class is now ${Class.name}`)
                .setColor(this.client.color)

            this.user.send(classGivenEmbed)
        } else if (!this.isAdded) {
            if (User.className !== Class.name) {
                const invalidClassUnreactionEmbed = new Discord.MessageEmbed()
                    .addField(`Error`, `Cannot remove a class you don't have assigned.`)
                    .setColor(this.client.color)

                this.user.send(invalidClassUnreactionEmbed)
                return
            }

            const response = await this.getYesOrNoResponse(`By removing yourself from this class you will lose 75 percent of your points, please use this option if you die.`, 60, await this.user.createDM())
            if (response === true) {
                await User.update({
                    className: null,
                    deathCount: User.deathCount + 1,
                    points: User.points * 0.25
                })

                await this.client.database[`ItemLog`].update(
                    {
                        isActive: false
                    },
                    {
                        where: {
                            recipientId: User.userId
                        }
                    })

                const classRemovedEmbed = new Discord.MessageEmbed()
                    .addField(`Success`, `You are no longer a ${Class.name}`)
                    .setColor(this.client.color)

                this.user.send(classRemovedEmbed)
            } else {
                const classNotRemovedEmbed = new Discord.MessageEmbed()
                    .addField(`Success`, `Your class was **not** removed.`)
                    .setColor(this.client.color)

                this.user.send(classNotRemovedEmbed)
            }
        }
    }

    async handleItemSubmissionReaction() {
        return new Promise(async resolve => {
            if (this.messageReaction.emoji.name === itemSubmissionEmoji) {
                const command = this.client.commands.get(`SUBMITITEM`)
                if (command) {
                    command.run(this.client, this.user, this.guild, this.message, [token])
                }
            }

            resolve()
        })
    }

    async handlePendingItemSubmissionReaction() {
        return new Promise(async resolve => {
            if (this.messageReaction.emoji.name === keyEmoji) {
                await this.message.reactions.removeAll()
                await this.message.react(checkmarkEmoji)
                await this.message.react(destroyLeaveEmoji)
                await this.message.react(lockEmoji)
            } else if (this.messageReaction.emoji.name === lockEmoji) {
                await this.message.reactions.removeAll()
                await this.message.react(keyEmoji)
            } else if (this.messageReaction.emoji.name === checkmarkEmoji) {
                const command = this.client.commands.get(`REVIEWITEM`)
                if (command) {
                    command.run(this.client, this.user, this.message, [token], true)
                }
            } else if (this.messageReaction.emoji.name === destroyLeaveEmoji) {
                const command = this.client.commands.get(`REVIEWITEM`)
                if (command) {
                    command.run(this.client, this.user, this.message, [token], false)
                }
            }

            resolve()
        })
    }

    async handleTeamReaction() {
        const member = await this.guild.members.fetch(this.user.id);
        if (!member) return

        let command
        if (this.messageReaction.emoji.name === teamCreationEmoji) {
            command = this.client.commands.get(`CREATETEAM`)
        } else if (this.messageReaction.emoji.name === invitationEmoji) {
            command = this.client.commands.get(`INVITETOTEAM`)
        } else if (this.messageReaction.emoji.name === matchmakingToggleEmoji) {
            command = this.client.commands.get(`TOGGLEMATCHMAKING`)
        } else if (this.messageReaction.emoji.name === matchmakingEmoji) {
            command = this.client.commands.get(`MATCHMAKE`)
        } else if (this.messageReaction.emoji.name === kickTeammateEmoji) {
            command = this.client.commands.get(`KICKTEAMMEMBER`)
        } else if (this.messageReaction.emoji.name === destroyLeaveEmoji) {
            command = this.client.commands.get(`DESTROYLEAVETEAM`)
        }

        if (command) {
            command.run(this.client, member, this.guild, this.message, [token])
        }
    }

    async handleTeamInvitationReaction() {
        let isAccepted;
        if (this.messageReaction.emoji.name === checkmarkEmoji) {
            isAccepted = true
        } else if (this.messageReaction.emoji.name === destroyLeaveEmoji) {
            isAccepted = false
        } else {
            return
        }

        const command = this.client.commands.get(`ACCEPTDECLINEINVITATION`)
        if (command) {
            command.run(this.client, this.message, [token], isAccepted)
        }
    }

    async handleVerificationReaction() {
        const verifiedRole = this.guild.roles.get(this.Guild.verifiedRoleId)
        if (!verifiedRole) return

        const member = await this.guild.members.fetch(this.user.id);
        if (!member) return

        if (this.messageReaction.emoji.name === emailEmoji) {
            const channel = await this.user.createDM().catch()
            if (!channel) {
                return
            }

            const embed = new Discord.MessageEmbed()
                .addField(`Your Discord ID`, "Below is your **Discord Account ID**, please put it in your **RealmEye** description.\n```css\n" + this.user.id + "\n```")
                .setColor(this.client.color)

            channel.send(embed)
        } else if (this.messageReaction.emoji.name === checkmarkEmoji) {
            const command = this.client.commands.get(`VERIFY`)
            if (command) {
                command.run(this.client, member, this.message, [token])
            }
        }
    }

    /**
* @returns {String}
* @function Gets a response from a user, returns it in a string.
* @param {String} question The question asked to the user.
* @param {Number} timeLimit The time limit for the question in seconds.
* @param {Discord.TextChannel} DMChannel  The text DMChannel in which the answer is given.
*/
    async getYesOrNoResponse(question, timeLimit, DMChannel) {
        return new Promise(async (resolve, reject) => {
            let embed = new Discord.MessageEmbed()
                .addField(`Are you sure?`, `${question}`)
                .setColor(this.client.color)

            const messageSent = await DMChannel.send(embed)
            const filter = () => {
                return true
            }
            const reactionCollector = new Discord.ReactionCollector(messageSent, filter, { time: timeLimit * 1000 })
            await messageSent.react(checkmarkEmoji)
            await messageSent.react(destroyLeaveEmoji)

            reactionCollector.on(`collect`, async (reaction, reactionUser) => {
                if (reactionUser.bot) {
                    return
                }

                if (reaction.emoji.name === checkmarkEmoji) {
                    reactionCollector.stop()
                    await messageSent.delete()
                    resolve(true)
                } else if (reaction.emoji.name === destroyLeaveEmoji) {
                    reactionCollector.stop()
                    await messageSent.delete()
                    resolve(false)
                }
            })

            reactionCollector.on(`end`, (reason) => {
                if (reason === `time`) {
                    resolve(false)
                }
            })
        })
    }
}