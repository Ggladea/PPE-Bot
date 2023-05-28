const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const ClassRoleDispenser = await Guild.getClassRoleDispenser()
    if (ClassRoleDispenser === null) {
        message.channel.send(`You do not have a Class Role Dispenser setup.`)
        return
    }

    const className = args.join(` `)
    let Classes = await ClassRoleDispenser.getClasses({ where: { name: capitalizeFirstLetter(className.toLowerCase()) } })
    if (Classes.length > 0) {
        await Classes[0].destroy()

        const Users = await Guild.getUsers()
        for (const User of Users) {
            await User.update({
                className: null
            })
        }

        Classes = await ClassRoleDispenser.getClasses()
        let classString = ``
        if (Classes.length > 0) {
            const classNames = Classes.map(Class => `${Class.name} • ${client.emojis.get(Class.emojiId).toString()}`)
            classString = classNames.join(`\n`)
        } else {
            classString = `No Classes Found`
        }

        const classRoleDispenserChannel = client.channels.get(ClassRoleDispenser.channelId)
        const classRoleDispenserMessage = await classRoleDispenserChannel.messages.fetch(ClassRoleDispenser.messageId)
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${message.guild.name} Class Role Dispenser`, client.user.avatarURL())
            .addField(`Classes`, `${classString}`)
            .setFooter(`⚠ Please make sure that you don't have DMs turned off to get status updates.`)
            .setColor(client.color)

        await classRoleDispenserMessage.edit(embed)
        await classRoleDispenserMessage.reactions.removeAll()

        for (const Class of Classes) {
            const emoji = client.emojis.get(Class.emojiId)
            await classRoleDispenserMessage.react(emoji)
        }

        message.channel.send(`Removed Class from all Classes, no users will now have this Class.`)
    } else {
        message.channel.send(`No such Class found.`)
    }
}

module.exports.help = {
    "category": `Class`,
    "commandName": `removeClass`,
    "example": "`>ping`",
    "explanation": `Checks the current ping for the bot, tests if it is online.`,
    "isRestricted": true
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}