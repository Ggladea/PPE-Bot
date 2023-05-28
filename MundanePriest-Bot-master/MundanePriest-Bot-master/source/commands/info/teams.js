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

    const Teams = await Guild.getTeams({ order: Sequelize.literal('random()'), limit: 10 })
    let teamNames = ``
    for (const Team of Teams) {
        teamNames += `**[#${Team.index}]** ${Team.teamNameUnchanged}\n`
    }

    let teamNamesString = teamNames ? teamNames : `No teams found.`
    const teamNamesEmbed = new Discord.MessageEmbed()
        .addField(`10 Random Team Names`, teamNamesString)
        .setColor(client.color)

    await message.channel.send(teamNamesEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `teams`,
    "example": "`>teams`",
    "explanation": `Shows 10 random team names.`,
    "isRestricted": false
}