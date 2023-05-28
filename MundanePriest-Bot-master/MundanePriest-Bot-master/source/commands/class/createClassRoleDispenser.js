const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission(`ADMINISTRATOR`)) {
        message.channel.send(`Sorry, only people with the Administrator permission can create the Class Role Dispenser.`)
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const ClassRoleDispenser = await Guild.getClassRoleDispenser()

    if (ClassRoleDispenser) {
        await message.channel.send(`There was a verification dispenser set up already, it will not work from now on and now a new dispenser will be set up`)
        await ClassRoleDispenser.destroy()
    }

    const channel = client.channels.get(Guild.classDispenserChannelId)

    if (!channel) {
        message.channel.send(`Failed to fetch the Class Role Dispenser channel, please make sure it's setup correctly.`)
        return
    }

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name} Class Role Dispenser`, client.user.avatarURL())
        .addField(`Classes`, `No Classes Setup`)
        .setFooter(`⚠ Please make sure that you don't have DMs turned off to get status updates.`)
        .setColor(client.color)

    const sentMessage = await channel.send(embed)

    await Guild.createClassRoleDispenser({
        channelId: channel.id,
        messageId: sentMessage.id
    }).then(async () => {
        message.channel.send(`Done`)
    })
}

module.exports.help = {
    "category": `Class`,
    "commandName": `createClassRoleDispenser`,
    "example": "`>createClassRoleDispenser`",
    "explanation": `Creates a class role dispenser in a setup channel.`,
    "isRestricted": true
}