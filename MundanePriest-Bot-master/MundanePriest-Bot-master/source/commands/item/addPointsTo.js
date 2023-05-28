const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    let member;

    const input = args[0]
    if (input === undefined) {
        member = await message.guild.members.fetch(message.author.id)
    } else {
        //Try to grab numbers only
        const inputReplaced = input.replace(/[^0-9]/g, '')
        if (inputReplaced.length < 17) {
            const searchResult = message.guild.members.find(member => member.displayName.toUpperCase() == input.toUpperCase())
            if (searchResult !== undefined) {
                member = await message.guild.members.fetch(searchResult)
            } else {
                await message.react("⚠")
                return
            }
        } else {
            member = await message.guild.members.fetch(inputReplaced)
        }
    }

    if (!member) {
        await message.channel.send(`Invalid user input.`)
        
        return
    }

    const pointsToAdd = parseFloat(args[1])
    if (!pointsToAdd) {
        await message.channel.send(`Invalid point value.`)

        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const [User] = await Guild.getUsers({ where: { userId: member.id } })
    await User.update({
        points: User.points + pointsToAdd
    })

    await message.channel.send(`Added **${pointsToAdd}** Points to ${member.toString()}`)
}

module.exports.help = {
    "category": `Item`,
    "commandName": `addPointsTo`,
    "example": "`>addPointsTo Example#1234 50` | `>addPointsTo [User] [Point Amount]`",
    "explanation": `Adds a specified amount of points to a user.`,
    "isRestricted": true
}