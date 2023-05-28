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

    if (!Season) {
        await message.channel.send(`No season found.`)

        return
    }
    
    const teamsAllowed = Season.teamsEnabled ? `Yes` : `No`
    const seasonStatus = Season.isStarted ? `Started` : `Inactive`

    const classPairs = Season.classPairs ? Object.values(JSON.parse(Season.classPairs)) : []
    let classPairString = ``
    if (classPairs.length > 0) {
        for (let i = 1; i <= classPairs.length; i++) {
            const pair = classPairs[i - 1]

            if (pair.length === 2) {
                classPairString += `[#${i}] ${pair[0]} & ${pair[1]}\n`
            } else if (pair.length === 1) {
                classPairString += `[#${i}] ${pair[0]}`
            }
        }
    } else {
        classPairString = `**No Pairs**`
    }

    const seasonEmbed = new Discord.MessageEmbed()
        .setColor(client.color)
        .addField(`Season #${Season.index}`,
        `
Max Members Per Team • ${Season.maxMemberCount}
Teams Allowed • ${teamsAllowed}
Status • ${seasonStatus}`)
        .addField(`Class Pairs`, classPairString)

    message.channel.send(seasonEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `season`,
    "example": "`>season`",
    "explanation": `Displays the current season.`,
    "isRestricted": false
}