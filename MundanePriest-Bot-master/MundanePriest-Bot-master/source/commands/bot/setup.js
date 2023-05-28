const Discord = require(`discord.js`)
const DatabaseHandlerModule = require(`../../handlers/DatabaseHandler`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const DatabaseHandler = new DatabaseHandlerModule(client, message.guild)

    await DatabaseHandler.isCreated().then(async exists => {
        if (!exists) {
            message.channel.send("Guild's database entry does not exist, creating.")
            await DatabaseHandler.createDatabaseEntry()
        }

        const Guild = await client.database[`Guild`].findOne({
            where: {
                guildId: message.guild.id
            }
        })

        const prefix = Guild.prefix
        const minimumBotManageRole = message.guild.roles.get(Guild.minimumBotManageRoleId)
        const minimumBotManageRoleString = minimumBotManageRole ? minimumBotManageRole.toString() : `Not Set Up`

        const classDispenserChannel = client.channels.get(Guild.classDispenserChannelId)
        const classDispenserChannelString = classDispenserChannel ? classDispenserChannel.toString() : `Not Set Up`

        const itemSubmissionDispenserChannel = client.channels.get(Guild.itemSubmissionDispenserChannelId)
        const itemSubmissionDispenserChannelString = itemSubmissionDispenserChannel ? itemSubmissionDispenserChannel.toString() : `Not Set Up`

        const itemSubmissionPreviewChannel = client.channels.get(Guild.itemSubmissionsChannelId)
        const itemSubmissionPreviewChannelId = itemSubmissionPreviewChannel ? itemSubmissionPreviewChannel.toString() : `Not Set Up`

        const teamCreationDispenserChannel = client.channels.get(Guild.teamCreationDispenserChannelId)
        const teamCreationDispenserChannelString = teamCreationDispenserChannel ? teamCreationDispenserChannel.toString() : `Not Set Up`

        const verificationDispenserChannel = client.channels.get(Guild.verificationDispenserChannelId)
        const verificationDispenserChannelString = verificationDispenserChannel ? verificationDispenserChannel.toString() : `Not Set Up`

        const verificationLogChannel = client.channels.get(Guild.verificationLogChannelId)
        const verificationLogChannelString = verificationLogChannel ? verificationLogChannel.toString() : `Not Set Up`

        const verifiedRole = message.guild.roles.get(Guild.verifiedRoleId)
        const verifiedRoleString = verifiedRole ? verifiedRole.toString() : `Not Set Up`

        let setupEmbed = new Discord.MessageEmbed()
            .addField(`${client.user.username} Setup for ${message.guild.name}`,
`**Bot**
Minimum Bot Manage Role • ${minimumBotManageRoleString}
Prefix • **${prefix}** 

**Class Assignment**
Class Dispenser Channel • ${classDispenserChannelString}

**Item Submission**
Item Submission Dispenser Channel • ${itemSubmissionDispenserChannelString}
Item Submission Preview Channel • ${itemSubmissionPreviewChannelId}

**Team Creation**
Team Creation Dispenser Channel • ${teamCreationDispenserChannelString}

**Verification**
Verification Dispenser Channel • ${verificationDispenserChannelString}
Verification Log Channel • ${verificationLogChannelString}
Verified Role • ${verifiedRoleString}`)
            .setColor(client.color)
            .setTimestamp()

        message.channel.send(setupEmbed)
    }).catch(error => {
        console.log(error)
        message.channel.send(`Error while fetching data for the setup, try again.`)
    })
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `setup`,
    "example": "`>setup`",
    "explanation": `Shows the setup for the bot.`,
    "isRestricted": true
}