const Discord = require(`discord.js`)

const teamCreationEmoji = `🛠`
const invitationEmoji = `📧`
const matchmakingToggleEmoji = `📂`
const matchmakingEmoji = `👀`
const kickTeammateEmoji = `👢`
const destroyLeaveEmoji = `❌`

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission(`ADMINISTRATOR`)) {
        message.channel.send(`Sorry, only people with the Administrator permission can create the team creation dispenser.`)
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const TeamCreationDispenser = await Guild.getTeamCreationDispenser()

    if (TeamCreationDispenser) {
        await message.channel.send(`There was a team creation dispenser set up already, it will not work from now on and now a new dispenser will be set up`)
        await TeamCreationDispenser.destroy()
    }

    const channel = client.channels.get(Guild.teamCreationDispenserChannelId)

    if (!channel) {
        message.channel.send(`Failed to fetch the team creation dispenser channel, please make sure it's setup correctly.`)
        return
    }

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name} Team Creation Dispenser`, client.user.avatarURL())
        .addField(`Instructions`,
            `${teamCreationEmoji} • Creates a team if you are not a part of one

${invitationEmoji} • Allows you to invite a person to your team via either **Discord Tag** or **Server Nickname**

${matchmakingToggleEmoji} • Toggles the matchmaking option for your team, allows random people to join your team

${matchmakingEmoji} • Searches for a random team that is open and makes you join it

${kickTeammateEmoji} • Allows you to kick a team member from your team if you are a leader

${destroyLeaveEmoji} • Deletes your current team or makes you leave your current team`)
        .setFooter(`⚠ Please make sure that you don't have DMs turned off to get status updates`)
        .setColor(client.color)

    const sentMessage = await channel.send(embed)
    await sentMessage.react(teamCreationEmoji)
    await sentMessage.react(invitationEmoji)
    await sentMessage.react(matchmakingToggleEmoji)
    await sentMessage.react(matchmakingEmoji)
    await sentMessage.react(kickTeammateEmoji)
    await sentMessage.react(destroyLeaveEmoji)

    await Guild.createTeamCreationDispenser({
        channelId: channel.id,
        messageId: sentMessage.id
    }).then(async () => {
        message.channel.send(`Done`)
    })
}

module.exports.help = {
    "category": `Team`,
    "commandName": `createTeamCreationDispenser`,
    "example": "`>createTeamCreationDispesner`",
    "explanation": `Creates the team creation dispenser.`,
    "isRestricted": true
}