const Discord = require(`discord.js`)
const Sequelize = require(`sequelize`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()

    if (!Season.isStarted) {
        await message.channel.send(`Season is not active.`)
        return
    }

    if (!Season.teamsEnabled) {
        await message.channel.send(`Teams are not enabled this season.`)
        return
    }

    const teams = []
    const Teams = await Guild.getTeams()
    for (const Team of Teams) {
        let isUserTeam = false
        let points = 0

        const Members = await client.database[`User`].findAll({ where: { teamId: Team.index } })
        for (const Member of Members) {
            if (Member.userId === message.author.id) {
                isUserTeam = true
            }

            points += Member.points
        }

        const team = {
            isUserTeam: isUserTeam,
            teamName: Team.teamNameUnchanged,
            points: points
        }

        teams.push(team)
    }

    teams.sort(compareTeam)

    let teamNames = ``
    let userTeamIndex
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i]
        if (team.isUserTeam) {
            userTeamIndex = i + 1
        }

        if (i < 20) {
            teamNames += `**[#${i + 1}]** ${team.teamName} | ${team.points} Points\n`
        }
    }

    const footerString = userTeamIndex ? `Your team's position is [#${userTeamIndex}]` : `You do not have a team`
    const teamNamesString = teamNames ? teamNames : `No teams found.`

    const teamNamesEmbed = new Discord.MessageEmbed()
        .addField(`Top 20 Teams`, teamNamesString)
        .setFooter(footerString)
        .setColor(client.color)

    await message.channel.send(teamNamesEmbed)
}

function compareTeam(lhs, rhs) {
    return rhs.points - lhs.points
}

module.exports.help = {
    "category": `Info`,
    "commandName": `topTeams`,
    "example": "`>topTeams`",
    "explanation": `Shows the top 20 teams.`,
    "isRestricted": false
}