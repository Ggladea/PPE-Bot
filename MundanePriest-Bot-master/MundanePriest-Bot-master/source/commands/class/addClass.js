
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

    let invalidEmoji = false
    const emojiName = String(args.splice(args.length - 1, 1))
    const emoji = client.emojis.get(emojiName.replace(/[^0-9]/g, '')) ? client.emojis.get(emojiName.replace(/[^0-9]/g, '')) : emojiName
    const roleName = args.join(` `)
    message.react(emoji).catch(() => {
        message.channel.send(`That emoji is invalid.`)
        invalidEmoji = true
    })
    if (invalidEmoji) return

    let invalidMessage = false
    const classRoleDispenserChannel = client.channels.get(ClassRoleDispenser.channelId)
    const classRoleDispenserMessage = await classRoleDispenserChannel.messages.fetch(ClassRoleDispenser.messageId).catch(() => {
        message.channel.send(`It seems like the Class Role Dispenser Message does not exist.`)
        invalidMessage = true
    })
    if (invalidMessage) return

    if (!emoji.id) {
        await message.channel.send(`You have to use a custom emoji for adding classes.`)
        return
    }

    let roleAlreadyExists = false
    await ClassRoleDispenser.createClass({
        emojiId: emoji.id,
        name: capitalizeFirstLetter(roleName.toLowerCase())
    }).catch(() => {
        message.channel.send(`It seems like there is already a role with either this name or role.`)
        roleAlreadyExists = true
    })
    if (roleAlreadyExists) return

    const Classes = await ClassRoleDispenser.getClasses()
    const classString = Classes.map(Class => `${Class.name} • ${client.emojis.get(Class.emojiId).toString()}`).join(`\n`)
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name} Class Role Dispenser`, client.user.avatarURL())
        .addField(`Classes`, `${classString}`)
        .setFooter(`⚠ Please make sure that you don't have DMs turned off to get status updates.`)
        .setColor(client.color)

    await classRoleDispenserMessage.edit(embed)
    await classRoleDispenserMessage.react(emoji)
    await message.channel.send(`Class added.`)
}

module.exports.help = {
    "category": `Class`,
    "commandName": `addClass`,
    "example": "`>addClass [Class Name Here] [Class Emoji]`",
    "explanation": `Adds a role to the Class Role Dispenser.`,
    "isRestricted": true
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}