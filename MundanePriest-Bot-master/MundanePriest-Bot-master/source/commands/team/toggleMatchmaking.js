const Discord = require(`discord.js`)

const questionTime = 60 //in seconds
const token = `secretTokenLanis5671` //also found in ReactionHandler
const resumptionToken = `resumedVerificationLanis5671` //also found in ActiveModuleResumptionHandler

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.GuildMember} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, guild, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: guild.id } })
    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()
    if (!Season.isStarted) {
        const noSeasonEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No season is currently active.`)
            .setColor(client.color)

        await author.send(noSeasonEmbed)
        return
    }
    
    const [User] = await Guild.getUsers({ where: { userId: author.id } })
    const [Team] = await Guild.getTeams({ where: { teamLeaderId: User.userId } })

    if (!Team) {
        const notALeaderEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You do not seem to be a leader of a team.`)
            .setColor(client.color)
        await author.send(notALeaderEmbed)
        return
    }

    const isMatchmakingEnabled = Team.isMatchmakingEnabled

    if (isMatchmakingEnabled) {
        await Team.update({
            isMatchmakingEnabled: false
        })

        const matchmakingDisabledEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `Team matchmaking has been successfully disabled.`)
            .setColor(client.color)
        
        await author.send(matchmakingDisabledEmbed)
        return
    } else {
        await Team.update({
            isMatchmakingEnabled: true
        })

        const matchmakingEnabledEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `Team matchmaking has been successfully enabled.`)
            .setColor(client.color)
        
        await author.send(matchmakingEnabledEmbed)
        return
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `toggleMatchmaking`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax
    while (L && this.length) {
        what = a[--L]
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1)
        }
    }
    return this;
};
