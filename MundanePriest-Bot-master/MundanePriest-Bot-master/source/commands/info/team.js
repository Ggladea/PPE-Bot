const Discord = require(`discord.js`)


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

    let Team
    let input = args.join(` `)
    if (!input) {
        const [User] = await Guild.getUsers({ where: { userId: message.author.id } })
        if (User.teamId) {
            Team = await client.database[`Team`].findOne({ where: { index: User.teamId } })
        }
    } else {
        Team = await client.database[`Team`].findOne({ where: { teamName: input.toLowerCase() } })
    }

    if (!Team) {
        await message.react("⚠")
        return
    }

    const TeamMembers = await Guild.getUsers({ where: { teamId: Team.index } })
    let leaderClass = ``
    let leaderName = ``
    let leaderPoints = 0

    let teammateNames = ``
    let points = 0
    for (const TeamMember of TeamMembers) {
        const member = await message.guild.members.fetch(TeamMember.userId).catch(() => { /** ignore */})
        points += TeamMember.points

        if (TeamMember.userId !== Team.teamLeaderId) {
            const teamMemberName = member.displayName ? member.displayName : `User ID: ${TeamMember.userId}`
            const teamMemberClass = TeamMember.className
            const teamMemberClassString = teamMemberClass ? teamMemberClass : `No Class`
            teammateNames += `**[Member]** ${teamMemberName} • ${teamMemberClassString} | ${TeamMember.points} Points\n`
        } else {
            leaderName = member.displayName ? member.displayName : `User ID: ${TeamMember.userId}`
            leaderClass = TeamMember.className
            leaderPoints = TeamMember.points
        }
    }

    const teamName = Team.teamNameUnchanged
    const leaderClassString = leaderClass ? leaderClass : `No Class`
    const teammateNamesString = teammateNames ? teammateNames : `No Teammates`

    const teamProfileEmbed = new Discord.MessageEmbed()
        .addField(`Team Profile for ${teamName} | #${Team.index}`,
            `**Points • ${points}**

**[Leader]** ${leaderName} • ${leaderClassString} | ${leaderPoints} Points
${teammateNamesString}
`)
        .setColor(client.color)

    await message.channel.send(teamProfileEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `team`,
    "example": "`>team` | `>team Team Name Here`",
    "explanation": `Shows a team's information.`,
    "isRestricted": false
}