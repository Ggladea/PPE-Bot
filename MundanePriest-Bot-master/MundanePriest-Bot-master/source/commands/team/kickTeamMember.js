const Discord = require(`discord.js`)

const userQuestion = `user`
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
    let isResumed = false
    if (args[0] !== token) return
    if (args[1] === resumptionToken) isResumed = true

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: guild.id } })
    const [User] = await Guild.getUsers({ where: { userId: author.id } })
    const [Team] = await Guild.getTeams({ where: { teamLeaderId: User.userId } })
    const TeamMembers = await Guild.getUsers({ where: { teamId: Team.index } })

    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()
    if (!Season.isStarted) {
        const noSeasonEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No season is currently active.`)
            .setColor(client.color)

        await author.send(noSeasonEmbed)
        return
    }
    
    if (!Season.teamsEnabled) {
        const teamsDisabledEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `Teams are disabled this season.`)
            .setColor(client.color)


        await author.send(teamsDisabledEmbed)
        return
    }

    if (!Team) {
        const notALeaderEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You do not seem to be a leader of a team.`)
            .setColor(client.color)
        await author.send(notALeaderEmbed)
        return
    }

    if (TeamMembers.length === 1) {
        const noMembersEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `There are no other members in your team.`)
            .setColor(client.color)

        await author.send(noMembersEmbed)
        return
    }

    const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
    const [TeamKickPrompt] = await TeamCreationDispenser.getTeamKickPrompts({ where: { userId: author.id } })
    if (TeamKickPrompt && !isResumed) {
        const teamInvitationPromptExistsEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `It seems like you are already kicking a person.`)
            .setColor(client.color)

        await author.send(teamInvitationPromptExistsEmbed)
        return
    }

    const exampleTag = "`Example#1234`"
    const exampleNickname = "`ExampleName`"
    const kickQuestion = {
        value: `What is the name of the person you want to kick from your team?\nPlease input either a tag (${exampleTag}) or nickname (${exampleNickname}).`,
        type: userQuestion
    }
    const memberToKick = await getResponse(kickQuestion.value, kickQuestion.type, author, questionTime, await author.createDM())

    if (memberToKick) {
        const [TeamKickPrompt] = await TeamCreationDispenser.getTeamKickPrompts({ where: { userId: author.id } })
        const [TargetUser] = await Guild.getUsers({ where: { userId: memberToKick.id } })

        if (TargetUser.teamId !== User.teamId) {
            const alreadyInATeamEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `This member is not in your team.`)
                .setColor(client.color)

            await author.send(alreadyInATeamEmbed)
            await TeamKickPrompt.destroy()
            return
        }

        await TargetUser.update({
            teamId: null
        })

        await TeamKickPrompt.destroy()

        const youHaveBeenKickedEmbed = new Discord.MessageEmbed()
            .addField(`Kicked from team`, `You have been kicked from your team by ${author.user.tag}.`)
            .setColor(client.color)
        const user = client.users.get(TargetUser.userId)
        await user.send(youHaveBeenKickedEmbed).catch(() => { /** ignore */ })

        const successfullyKickedEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `You have successfully kicked ${user.tag} from your team.`)
            .setColor(client.color)

        await author.send(successfullyKickedEmbed)
    } else {
        const [TeamKickPrompt] = await TeamCreationDispenser.getTeamKickPrompts({ where: { userId: author.id } })

        const noInputEmbed = new Discord.MessageEmbed()
            .addField(`No Input`, `Not sending kicking anyone.`)
            .setColor(client.color)
        await author.send(noInputEmbed)
        await TeamKickPrompt.destroy()
    }

    /**
* @returns {String}
* @function Gets a response from a user, returns it in a string.
* @param {String} question The question asked to the user.
* @param {Discord.User} forUser The user for which the question is asked.
* @param {Number} timeLimit The time limit for the question in seconds.
* @param {Discord.TextChannel} channel  The text channel in which the answer is given.
*/

    async function getResponse(question, questionType, forUser, timeLimit, channel) {
        return new Promise(async resolve => {
            const filter = message => message.author.id === forUser.id
            const messageCollector = new Discord.MessageCollector(channel, filter, { time: timeLimit * 1000 })
            let response = null

            const questionEmbed = new Discord.MessageEmbed()
                .addField(`Question`, question)
                .setColor(client.color)

            if (!isResumed) {
                const messageSent = await channel.send(questionEmbed)
                await TeamCreationDispenser.createTeamKickPrompt({
                    channelId: messageSent.channel.id,
                    messageId: messageSent.id,
                    guildId: message.guild.id,
                    userId: author.id
                })
            }

            messageCollector.on(`collect`, async responseMessage => {
                if (responseMessage.content.length === 0) {
                    await channel.send(`Input is incorrect, try again.`)
                    return
                }

                if (questionType === userQuestion) {
                    const member = guild.members.find(member => member.nickname && member.nickname.toLowerCase() === responseMessage.content.toLowerCase() || member.user.tag.toLowerCase() === responseMessage.content.toLowerCase())
                    if (!member) {
                        const memberNotFoundEmbed = new Discord.MessageEmbed()
                            .addField(`Error`, `Could not find a person with this name in the server.`)
                            .setColor(client.color)
                        await channel.send(memberNotFoundEmbed)

                        return
                    } else {
                        response = member
                        messageCollector.stop()
                    }

                }
            })

            messageCollector.on(`end`, (collected, reason) => {
                resolve(response)
            })
        })
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `kickTeamMember`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}