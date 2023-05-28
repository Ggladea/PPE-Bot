const Discord = require(`discord.js`)

const token = `secretTokenLanis5671` //also found in ReactionHandler
const resumptionToken = `resumedVerificationLanis5671` //also found in ActiveModuleResumptionHandler

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 * @param {Boolean} isAccepted Whether the invite was accepted or not.
 */

module.exports.run = async (client, message, args, isAccepted) => {
    if (args[0] !== token) return

    const TeamInvite = await client.database[`TeamInvite`].findOne({ where: { messageId: message.id } })
    const Team = await client.database[`Team`].findOne({ where: { index: TeamInvite.teamId } })
    if (isAccepted) {
        const Guild = await client.database[`Guild`].findOne({ where: { guildId: TeamInvite.guildId } })
        const [User] = await Guild.getUsers({ where: { userId: TeamInvite.recipientId } })

        if (User.teamId) {
            const alreadyInTeamEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `You are already in a team, declining invite.`)
                .setColor(client.color)
            await TeamInvite.destroy()
            await message.delete()
            await message.channel.send(alreadyInTeamEmbed)

            return
        }

        const Seasons = await Guild.getSeasons()
        const Season = Seasons.pop()
        if (!Season) {
            const noSeasonEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `There is no season setup, declining invite.`)
                .setColor(client.color)
            await TeamInvite.destroy()
            await message.delete()
            await message.channel.send(noSeasonEmbed)

            return
        }

        if (Season.teamsEnabled) {
            if (User.className) {
                const TeamMembers = await Guild.getUsers({ where: { teamId: Team.index } })
                if (TeamMembers.length === Season.maxMemberCount) {
                    const maxMemberCountReachedEmbed = new Discord.MessageEmbed()
                        .addField(`Error`, `${Team.name} is already full. Declining invite.`)
                        .setColor(client.color)

                    await message.delete()
                    await TeamInvite.destroy
                    await message.channel.send(maxMemberCountReachedEmbed)

                    return
                }

                const teamClasses = TeamMembers.map(TeamMember => {
                    if (TeamMember.className) {
                        return TeamMember.className
                    }
                })

                const classesObject = JSON.parse(Season.classPairs)
                const classes = Object.keys(classesObject).map(key => {
                    return classesObject[key]
                })

                for (const classPair of classes) {
                    if (classPair.includes(User.className)) {
                        classPair.remove(User.className)
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

                let invalidCompisition = false
                //even member count, one invalid pair will be a no no
                if (Season.maxMemberCount % 2 == 0) {
                    if (emptyPairs > 0) {
                        invalidCompisition = true
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
                        invalidCompisition = true
                    } else if (!isSoloPairLeft && emptyPairs > 1) {
                        invalidCompisition = true
                    }
                }

                for (const TeamMember of TeamMembers) {
                    if (User.className === TeamMember.className) {
                        invalidCompisition = true

                        break
                    }
                }

                if (invalidCompisition) {
                    const invalidCompositionEmbed = new Discord.MessageEmbed()
                        .addField(`Error`, `If you joined this team, you would have an invalid composition.\nTo fix this change your class accordingly.`)
                        .setColor(client.color)

                    await message.channel.send(invalidCompositionEmbed)
                    return
                }
            }
        } else {
            const teamsDisabledEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `Teams are disabled this season.`)
                .setColor(client.color)
            
                await TeamInvite.destroy()
                await message.delete()

            await message.channel.send(teamsDisabledEmbed)
            return
        }

        await TeamInvite.destroy()
        await message.delete()

        await User.update({
            teamId: Team.index
        })

        const user = client.users.get(User.userId)
        const successfullyAcceptedEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `You have successfully joined ${Team.teamNameUnchanged}`)
            .setColor(client.color)
        
            const leaderReportEmbed = new Discord.MessageEmbed()
            .addField(`Team Member Joined!`, `A user has accepted your team invite, they are now a part of your team.\nTheir name is **${user.tag}**`)
            .setColor(client.color)
        const leader = client.users.get(Team.teamLeaderId)
        await leader.send(leaderReportEmbed).catch()

        await message.channel.send(successfullyAcceptedEmbed)
        return
    } else {
        await TeamInvite.destroy()
        await message.delete()

        const inviteRejectedEmbed = new Discord.MessageEmbed()
            .addField(`Invite Rejected`, `The invite from **${Team.teamNameUnchanged}** rejected.`)
            .setColor(client.color)
        await message.channel.send(inviteRejectedEmbed)

        return
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `acceptDeclineInvitation`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}