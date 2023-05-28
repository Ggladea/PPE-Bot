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
        await message.send(`Season is not setup.`)
        return
    }
    
    const ClassRoleDispenser = await Guild.getClassRoleDispenser()
    const Classes = await ClassRoleDispenser.getClasses()
    let classString = ``
    if (Classes.length > 0) {
        const classNames = Classes.map(Class => `${Class.name} • ${client.emojis.get(Class.emojiId).toString()}`)
        classString = classNames.join(`\n`)
    } else {
        classString = `No Classes Found`
    }

    const classEmbed = new Discord.MessageEmbed()
        .addField(
`**Classes**`,
`${classString}`
            )
        .setColor(client.color)
        .setTimestamp()

    message.channel.send(classEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `classes`,
    "example": "`>classes`",
    "explanation": `Displays all setup classes for the server.`,
    "isRestricted": false
}