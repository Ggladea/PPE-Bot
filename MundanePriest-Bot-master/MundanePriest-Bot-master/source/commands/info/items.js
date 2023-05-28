const Discord = require(`discord.js`)
const Sequelize = require(`sequelize`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const Items = await Guild.getItems({ order: Sequelize.literal('random()'), limit: 10 })
    let itemNames = ``
    for (const Item of Items) {
        const shortName = Item.shortName ? Item.shortName : 'No Short Name'
        itemNames += `**[#${Item.index}]** ${Item.longName} | ${shortName}\n`
    }

    let itemNamesString = itemNames ? itemNames : `No Items Found.`
    const teamNamesEmbed = new Discord.MessageEmbed()
        .addField(`10 Random Item Names`, itemNamesString)
        .setColor(client.color)

    await message.channel.send(teamNamesEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `items`,
    "example": "`>items`",
    "explanation": `Shows 10 random item names.`,
    "isRestricted": false
}