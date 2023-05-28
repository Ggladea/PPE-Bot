const Discord = require(`discord.js`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const itemName = args.join(" ")
    if (!itemName) {
        await message.react("⚠")
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    let [Item] = await Guild.getItems({
        where: client.database.Sequelize.where(
            client.database.Sequelize.fn('upper', client.database.Sequelize.col('longName')),
            itemName.toUpperCase()
        )
    })

    if (!Item) {
        [Item] = await Guild.getItems({
            where: client.database.Sequelize.where(
                client.database.Sequelize.fn('upper', client.database.Sequelize.col('shortName')),
                itemName.toUpperCase()
            )
        })
    }

    if (!Item) {
        await message.react("⚠")
        return
    }

    const shortName = Item.shortName ? Item.shortName : 'No Short Name'
    const itemEmbed = new Discord.MessageEmbed()
        .setColor(client.color)
        .addField(`${Item.longName} | ${shortName}`,`
Point Values:
Archer • ${Item.archerValue}
Assasin • ${Item.assassinValue}
Huntress • ${Item.huntressValue}
Knight • ${ Item.knightValue}
Mystic • ${Item.mysticValue}
Necromancer • ${Item.necromancerValue}
Ninja • ${Item.ninjaValue}
Paladin • ${Item.paladinValue}
Priest • ${Item.priestValue}
Rogue • ${Item.rogueValue}
Samurai • ${Item.samuraiValue}
Sorcerer • ${Item.sorcererValue}
Trickster • ${Item.tricksterValue}
Warrior • ${Item.warriorValue}
Wizard • ${Item.wizardValue}
Kensei • ${Item.kenseiValue}
Bard • ${item.bardValue}
Summoner • ${item.summonerValue}`)
    
    await message.channel.send(itemEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `item`,
    "example": "`>item Cloak of the Planewalker`",
    "explanation": `Searches for an item and displays the information for it.`,
    "isRestricted": false
}