const Discord = require(`discord.js`)

const questionTime = 60 //in seconds
const stringQuestion = `string`

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
    const TeamCreationDispenser = await Guild.getTeamCreationDispenser()
    const [TeamCreationPrompt] = await TeamCreationDispenser.getTeamCreationPrompts({ where: { userId: author.id } })
    const [User] = await Guild.getUsers({ where: { userId: author.id } })

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

    if (TeamCreationPrompt && !isResumed) {
        const teamCreationPromptExistsEmbed = new Discord.MessageEmbed()
        .addField(`Error`, `It seems like you are already creating a team.`)
        .setColor(client.color)
        
        await author.send(teamCreationPromptExistsEmbed)
        return
    }   

    if (User.teamId) {
        const alreadyInTeamEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You already have a team, cannot create one.`)
            .setColor(client.color)
        await author.send(alreadyInTeamEmbed)
        
        return
    } else {
        const teamNameQuestion = {
            value: `What would you like your team name to be?`,
            type: stringQuestion
        }
        const teamName = await getResponse(teamNameQuestion.value, teamNameQuestion.type, author, questionTime, await author.createDM())
        const [TeamCreationPrompt] = await TeamCreationDispenser.getTeamCreationPrompts({ where: { userId: author.id } })

        if (teamName) {
            const Team = await Guild.createTeam({
                teamName: teamName.toLowerCase(),
                teamNameUnchanged: teamName,
                teamLeaderId: author.id
            })

            await User.update({
                teamId: Team.index
            })

            await TeamCreationPrompt.destroy()

            const teamCreatedEmbed = new Discord.MessageEmbed()
                .addField(`Success`, `Team '${teamName}' has been created.`)
                .setColor(client.color)

            await author.send(teamCreatedEmbed)
        } else {
            const noInputEmbed = new Discord.MessageEmbed()
                .addField(`No Input`, `Not creating team.`)
                .setColor(client.color)

            await author.send(noInputEmbed)
            await TeamCreationPrompt.destroy()
            return
        }
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
                await TeamCreationDispenser.createTeamCreationPrompt({
                    channelId: messageSent.channel.id,
                    messageId: messageSent.id,
                    guildId: message.guild.id,
                    userId: author.id
                })
            }

            messageCollector.on(`collect`, async message => {
                if (message.content.length === 0) {
                    await channel.send(`Input is incorrect, try again.`)
                    return
                }

                if (questionType === stringQuestion) {
                    if (message.content.length > 20) {
                        const nameTooLongEmbed = new Discord.MessageEmbed()
                            .addField(`Error`, `Max length for a team name is 20 characters.`)
                        await channel.send(nameTooLongEmbed)
                        
                        return
                    } else {
                        const Team = await Guild.getTeams({
                            where: {
                                teamName: message.content.toLowerCase()
                            }
                        })

                        if (Team.length > 0) {
                            const teamAlreadyExistsEmbed = new Discord.MessageEmbed()
                                .addField(`Error`, `There is already a team with that name.`)
                            await channel.send(teamAlreadyExistsEmbed)
                            return
                        }
                        response = message.content
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
    "commandName": `createTeam`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}