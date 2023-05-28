const Discord = require(`discord.js`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.GuildMember} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, guild, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: guild.id } })
    const Users = await Guild.getUsers({ where: { userId: author.id } })
    const User = Users.pop()
    const Teams = await Guild.getTeams({ where: { teamLeaderId: User.userId } })
    const Team = Teams.pop()

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
    
    if (!Team) {
        if (User.teamId) {
            const OldTeam = await client.database[`Team`].findOne({
                where: {
                    index: User.teamId
                }
            })

            await User.update({
                    teamId: null
            })

            const teamLeftEmbed = new Discord.MessageEmbed()
                .addField(`Success`, `Team ${OldTeam.teamNameUnchanged} successfully left.`)
                .setColor(client.color)
            await author.send(teamLeftEmbed)
        } else {
            const notInATeamEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `You are not in a team.`)
                .setColor(client.color)

            await author.send(notInATeamEmbed)
        }
    } else {
        const teamIndex = Team.index
        const TeamMembers = await client.database[`User`].findAll({
            where: {
                teamId: teamIndex
            }
        })

        const userNoLongerHasATeamEmbed = new Discord.MessageEmbed()
            .addField(`Team Disbanded`, `The team ${Team.teamNameUnchanged} that you were in was disbanded by the leader.`)
            .setColor(client.color)

        for (const TeamMember of TeamMembers) {
            if (TeamMember.userId !== User.userId) {
                const user = client.users.get(TeamMember.userId)
                await user.send(userNoLongerHasATeamEmbed).catch()
            }

            await TeamMember.update({
                teamId: null
            })
        }

        await Team.destroy()

        const teamDestroyedEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `Team ${Team.teamNameUnchanged} successfully disbanded.`)
            .setColor(client.color)
        await author.send(teamDestroyedEmbed)
    }

    return
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `destroyLeaveTeam`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}