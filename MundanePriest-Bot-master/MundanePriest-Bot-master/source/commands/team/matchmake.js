const Discord = require(`discord.js`)

const questionTime = 60 //in seconds
const token = `secretTokenLanis5671` //also found in ReactionHandler
const resumptionToken = `resumedVerificationLanis5671` //also found in ActiveModuleResumptionHandler

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.GuildMember} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, guild, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: guild.id } })
    const [User] = await Guild.getUsers({ where: { userId: author.id } })
    if (User.teamId) {
        const alreadyInTeamEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You are already in a team.`)
            .setColor(client.color)

        await author.send(alreadyInTeamEmbed)

        return
    }

    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()
    if (!Season.isStarted) {
        const noSeasonEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No season is currently active.`)
            .setColor(client.color)

        await author.send(noSeasonEmbed)
        return
    }

    if (!Season.teamsEnabled) {
        const teamsDisabledEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `Teams are disabled this season.`)
            .setColor(client.color)


        await author.send(teamsDisabledEmbed)
        return
    }

    let didFindTeam = false
    const Teams = await Guild.getTeams({ where: { isMatchmakingEnabled: true } })
    for (const Team of Teams) {
        if (User.className) {
            const TeamMembers = await Guild.getUsers({ where: { teamId: Team.index } })
            if (TeamMembers.length === Season.maxMemberCount) {
                continue
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
                continue
            } else {
                didFindTeam = true

                const teamFoundEmbed = new Discord.MessageEmbed()
                    .addField(`Success`, `A team has been found for you.\nYour new team is ${Team.teamNameUnchanged}`)
                    .setColor(client.color)

                await User.update({
                    teamId: Team.index
                })

                const leaderReportEmbed = new Discord.MessageEmbed()
                    .addField(`Team Member found!`, `Matchmaking has found a member for you, they are now a part of your team.\nTheir name is **${author.displayName}**`)
                    .setColor(client.color)
                const leader = client.users.get(Team.teamLeaderId)
                await leader.send(leaderReportEmbed).catch()

                await author.send(teamFoundEmbed)
                break
            }
        } else {
            const TeamMembers = await Guild.getUsers({ where: { teamId: Team.index } })
            if (TeamMembers.length === Season.maxMemberCount) {
                continue
            } else {
                didFindTeam = true

                const teamFoundEmbed = new Discord.MessageEmbed()
                    .addField(`Success`, `A team has been found for you.\nYour new team is ${Team.teamNameUnchanged}`)
                    .setColor(client.color)

                await User.update({
                    teamId: Team.index
                })

                const leaderReportEmbed = new Discord.MessageEmbed()
                    .addField(`Team Member Found!`, `Matchmaking has found a member for you, they are now a part of your team.\nTheir name is **${author.tag}**`)
                    .setColor(client.color)
                const leader = client.users.get(Team.teamLeaderId)
                await leader.send(leaderReportEmbed).catch()

                await author.send(teamFoundEmbed)
                break
            }
        }
    }

    if (!didFindTeam) {
        const noTeamFoundEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No available team was found with your current class.`)
            .setColor(client.color)

        await author.send(noTeamFoundEmbed)
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `matchmake`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}