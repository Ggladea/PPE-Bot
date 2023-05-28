const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const startedSeason = await Guild.getSeasons({
        where: {
            isEnded: false,
            isStarted: true
        }
    })

    if (startedSeason.length === 0) {
        message.channel.send(`There is no season to end.`)
        return
    } else {
        startedSeason[0].update({
            isStarted: false,
            isEnded: true
        })

        const Users = await Guild.getUsers()
        await Users.update({
            className: null
        })

        message.channel.send(`Season ${startedSeason[0].index} is now ended.`)
    }
}

module.exports.help = {
    "category": `Season`,
    "commandName": `endSeason`,
    "example": "`>endSeason`",
    "explanation": `Ends the current season.`,
    "isRestricted": true
}