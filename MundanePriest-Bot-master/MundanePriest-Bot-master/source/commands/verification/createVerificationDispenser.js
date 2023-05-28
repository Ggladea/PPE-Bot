const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission(`ADMINISTRATOR`)) {
        message.channel.send(`Sorry, only people with the Administrator permission can create the Verification Dispenser.`)
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const VerificationDispenser = await Guild.getVerificationDispenser()

    if (VerificationDispenser) {
        await VerificationDispenser.destroy()
        await message.channel.send(`There was a verification dispenser set up already, it will not work from now on and now a new dispenser will be set up`)
    }

    if (!Guild|| Guild.verifiedRoleID === null) {
        message.channel.send(`Sorry, you have not set up your Verified Role!`)
        return
    }
    const role = message.guild.roles.get(Guild.verifiedRoleId)
    const channel = client.channels.get(Guild.verificationDispenserChannelId)

    if (!role) {
        message.channel.send(`Failed to fetch the verified role, please make sure it's setup correctly.`)
        return
    } else if (!channel) {
        message.channel.send(`Failed to fetch the verified role channel, please make sure it's setup correctly.`)
        return
    }

    const checkmarkEmoji = `✅`
    const emailEmoji = `📧`
    let embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name} Verification Dispenser`, client.user.avatarURL())
        .addField(`Follow these steps to verify`,
            `**#1** Get your Discord Account ID with the ${emailEmoji} reaction.\n` +
            `**#2** Put it in your [RealmEye Profile's](https://www.realmeye.com/log-in) description.\n` +
            `**#3** Start the verification process and message the bot your **In Game Name**.\n\n` +
            `If you want to attempt to verify and confirm that you've put the ID in your description, react to ${checkmarkEmoji} and the bot will contact you in your DMs.`)
        .addBlankField()
        .setFooter(`⚠ Please make sure that you don't have DMs turned off.`)
        .setColor(client.color)

    const sentMessage = await channel.send(embed)

    await Guild.createVerificationDispenser({
        channelId: channel.id,
        messageId: sentMessage.id
    }).then(async () => {
        await sentMessage.react(emailEmoji)
        await sentMessage.react(checkmarkEmoji)
        message.channel.send(`Done`)
    })
}

module.exports.help = {
    "category": `Verification`,
    "commandName": `createVerificationDispenser`,
    "example": "`>createVerificationDispenser`",
    "explanation": `Creates the Verification Dispenser, which will let you assign the verified role to members.`,
    "isRestricted": true
}