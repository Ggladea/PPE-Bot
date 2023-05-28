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

    if (startedSeason.length > 0) {
        message.channel.send(`There is already a season started.`)
        return
    }
    
    const Season = await Guild.getSeasons({
        where: {
            isEnded: false,
            isStarted: false
        }
    })

    if (Season.length === 0) {
        message.channel.send(`There is no season to start.`)
        return
    }

    await Season[0].update({
        isStarted: true
    })

    const Users = await Guild.getUsers()
    await Users.update({
        points: 0
    })

    await client.database[`ItemLog`].update({
        isActive: false
    })
    
    message.channel.send(`Season ${Season[0].index} is now started.`)
}

module.exports.help = {
    "category": `Season`,
    "commandName": `startSeason`,
    "example": "`>startSeason`",
    "explanation": `Checks the current ping for the bot, tests if it is online.`,
    "isRestricted": true
}