const Discord = require(`discord.js`)

const acceptInviteEmoji = `✅`
const declineInviteEmoji = `❌`

const questionTime = 60 //in seconds
const userQuestion = `user`

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

    const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
    const [TeamInvitationPrompt] = await TeamCreationDispenser.getTeamInvitationPrompts({ where: { userId: author.id } })
    if (TeamInvitationPrompt && !isResumed) {
        const teamInvitationPromptExistsEmbed = new Discord.MessageEmbed()
        .addField(`Error`, `It seems like you are already creating an invite.`)
        .setColor(client.color)
        
        await author.send(teamInvitationPromptExistsEmbed)
        return
    } 

    const exampleTag = "`Example#1234`"
    const exampleNickname = "`ExampleName`"
    const teamNameQuestion = {
        value: `What is the name of the person you want to invite?\nPlease input either a tag (${exampleTag}) or nickname (${exampleNickname}).`,
        type: userQuestion
    }
    const memberToInvite = await getResponse(teamNameQuestion.value, teamNameQuestion.type, author, questionTime, await author.createDM())

    if (memberToInvite) {
        const [TeamInvitationPrompt] = await TeamCreationDispenser.getTeamInvitationPrompts({ where: { userId: author.id } })
        const [RecipientUser] = await Guild.getUsers({ where: { userId: memberToInvite.id } })

        if (RecipientUser.teamId) {
            const alreadyInATeamEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `This member already has a team.`)
                .setColor(client.color)

            await author.send(alreadyInATeamEmbed)
            await TeamInvitationPrompt.destroy()
            return
        }

        const [TeamInvite] = await Team.getTeamInvites({ where: { recipientId: memberToInvite.id } })
        if (TeamInvite) {
            const inviteAlreadyExistsEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `Invite for this user already exists.`)
                .setColor(client.color)

            await author.send(inviteAlreadyExistsEmbed)
            await TeamInvitationPrompt.destroy()
            return
        }

        const inviteEmbed = new Discord.MessageEmbed()
            .addField(`Team Invitation`,
                `
         You have been invited to join **${Team.teamNameUnchanged}**.
         
         ${acceptInviteEmoji} • Accept

         ${declineInviteEmoji} • Decline
         `)
            .setColor(client.color)

        let inviteSent = true
        const messageSent = await memberToInvite.send(inviteEmbed).catch(() => {
            inviteSent = false
        })

        if (inviteSent) {
            await messageSent.react(acceptInviteEmoji)
            await messageSent.react(declineInviteEmoji)
        } else {
            const cannotSendDMEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `Cannot send DMs to that person.`)
                .setColor(client.color)

            await author.send(cannotSendDMEmbed)
            await TeamInvitationPrompt.destroy()
            return
        }

        await Team.createTeamInvite({
            messageId: messageSent.id,
            guildId: TeamInvitationPrompt.guildId,
            teamId: Team.index,
            recipientId: memberToInvite.id
        })

        await TeamInvitationPrompt.destroy()

        const inviteSentEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `Invited the person to your team.`)
            .setColor(client.color)
        await author.send(inviteSentEmbed)
    } else {
        const [TeamInvitationPrompt] = await TeamCreationDispenser.getTeamInvitationPrompts({ where: { userId: author.id } })

        const noInputEmbed = new Discord.MessageEmbed()
            .addField(`No Input`, `Not sending team invite.`)
            .setColor(client.color)
        await author.send(noInputEmbed)
        await TeamInvitationPrompt.destroy()
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
                     await TeamCreationDispenser.createTeamInvitationPrompt({
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
    "commandName": `inviteToTeam`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}