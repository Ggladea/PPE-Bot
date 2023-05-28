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

    const Users = await Guild.getUsers()
    const users = []
    for (const User of Users) {
        const className = User.className ? User.className : `No Class`
        const user = {
            userId: User.userId,
            className: className,
            points: User.points
        }

        users.push(user)
    }
    users.sort(compareUser)

    let userNames = ``
    let userIndex
    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        if (message.author.id === user.userId) {
            userIndex = i + 1
        }

        if (i < 20) {
            const member = await message.guild.members.fetch(user.userId).catch(() => { /** ignore */})
            const memberName = member.displayName ? member.displayName : `User ID: ${user.userId}`
            userNames += `**[#${i + 1}]** ${memberName} • ${user.className} | ${user.points} Points\n`
        }
    }

    const footerString = `Your position is [#${userIndex}]`
    const userNamesString = userNames ? userNames : `No users found.`

    const userNamesEmbed = new Discord.MessageEmbed()
        .addField(`Top 20 Players`, userNamesString)
        .setFooter(footerString)
        .setColor(client.color)

    await message.channel.send(userNamesEmbed)
}

function compareUser(lhs, rhs) {
    return rhs.points - lhs.points
}

module.exports.help = {
    "category": `Info`,
    "commandName": `topPlayers`,
    "example": "`>topPlayers`",
    "explanation": `Shows the top 20 players.`,
    "isRestricted": false
}