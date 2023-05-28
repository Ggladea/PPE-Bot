const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    let member

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

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const [User] = await Guild.getUsers({ where: { userId: member.id } })
    const ItemLogs = await client.database[`ItemLog`].findAll({
        limit: 3,
        where: {
            recipientId: User.userId
        },
        order: [['createdAt', 'DESC']]
    })
    const Team = await client.database[`Team`].findOne({ where: { index: User.teamId } })
    const teamName = Team ? `${Team.teamNameUnchanged}` : `No Team Found`
  
    const className = User.className ? User.className : `No Class Chosen`
    const deathCount = User.deathCount ? User.deathCount : `0`
    const inGameName = User.inGameNameUnchanged ? User.inGameNameUnchanged : `No Name Found`
    const isExpelled = User.isExpelled ? `Yes` : `No`
    const isVerified = User.isVerified ? `Yes` : `No`
    const itemOneString = ItemLogs[0] ? `#1 ${ItemLogs[0].itemLongName} | ${ItemLogs[0].value} Points` : '#1 Item Name Here | 00 Points'
    const itemTwoString = ItemLogs[1] ? `#2 ${ItemLogs[1].itemLongName} | ${ItemLogs[1].value} Points` : '#2 Item Name Here | 00 Points'
    const itemThreeString = ItemLogs[2] ?  `#3 ${ItemLogs[2].itemLongName} | ${ItemLogs[2].value} Points` : '#3 Item Name Here | 00 Points'
    const profileEmbed = new Discord.MessageEmbed()
        .addField(`Profile for ${member.displayName} | #${User.index}`,
`**Points • ${User.points}**

Last 3 Point Submissions: 
${itemOneString}
${itemTwoString}
${itemThreeString}

Expelled • ${isExpelled}
Verified • ${isVerified}

Class • ${className} 
Death Count • ${deathCount}
In Game Name • ${inGameName}
Team • ${teamName}`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(client.color)
        .setFooter(`Date Joined`)
        .setTimestamp(`${member.joinedAt}`)

    await message.channel.send(profileEmbed)
}

module.exports.help = {
    "category": `Info`,
    "commandName": `profile`,
    "example": "`>profile`",
    "explanation": `Shows the profile for a user.`,
    "isRestricted": false
}