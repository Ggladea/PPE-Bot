const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

const stopKeyword = `stop`
const timeReason = `time`

const timeLimitPerQuestion = 60 //seconds

const booleanQuestion = `boolean`
const integerQuestion = `integer`
const stringQuestion = `string`

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const ClassRoleDispenser = await Guild.getClassRoleDispenser()
    if (!ClassRoleDispenser) {
        message.channel.send(`You do not have a Class Role Dispenser setup.`)
        return
    }

    const Classes = await ClassRoleDispenser.getClasses()
    const classNames = Classes.map(Class => Class.name)
    if (Classes.length == 0) {
        message.channel.send(`You do not have any classes setup.`)
        return
    }

    const startedSeason = await Guild.getSeasons({
        where: {
            isEnded: false,
            isStarted: true
        }
    })

    if (startedSeason.length > 0) {
        message.channel.send(`There is already a season started.`)
        return
    }

    const teamsEnabledQuestion = {
        value: `Do you want teams to be enabled?`,
        type: booleanQuestion
    }
    
    const maxMemberCountQuestion = {
        value: `How many members can a team have?`,
        type: integerQuestion
    }
    const teamsEnabled = await getResponse(teamsEnabledQuestion.value, teamsEnabledQuestion.type, message.member, timeLimitPerQuestion, message.channel)
    if (teamsEnabled === timeReason) {
        await message.channel.send(`No input received, stopping.`)
        return
    }

    const maxMemberCount = await getResponse(maxMemberCountQuestion.value, maxMemberCountQuestion.type, message.member, timeLimitPerQuestion, message.channel)
    if (maxMemberCount === timeReason) {
        await message.channel.send(`No input received, stopping.`)
        return
    }

    if (!teamsEnabled) {
        const Season = await Guild.getSeasons({
            where: {
                isEnded: false,
                isStarted: false
            }
        })

        if (Season[0]) {
            await Season[0].update({
                classPairs: null,
                maxMemberCount: maxMemberCount,
                teamsEnabled: false,
            })
        } else {
            await Guild.createSeason({
                maxMemberCount: maxMemberCount,
                teamsEnabled: false
            })
        }
    } else {
        const questions = [
        ]

        const classPairs = {}
        //create pairs to store in
        for (let i = 1; i <= classNames.length; i++) {
            const memberIndex = Math.ceil(i / 2)
            const pairName = i % 2 != 0 ? `First` : `Second`
            const question = {
                value: `Input the **${pairName} Class** for **Member #${memberIndex}**`,
                type: stringQuestion
            }

            if (i % 2 != 0) {
                const pairName = `pair${memberIndex}`
                classPairs[pairName] = []
            }

            questions.push(question)
        }

        //get data to store in the pairs
        //we store this as we will be removing classes from the list to know what we are left with
        const totalClassLength = classNames.length

        if (totalClassLength < 2) {
            await message.channel.send(`You need to have at least 2 classes to start a season setup.`)
            return
        }

        for (let i = 1; i <= totalClassLength; i++) {
            const question = questions[i - 1]
            const response = await getResponse(question.value, question.type, message.member, timeLimitPerQuestion, message.channel)
            if (response == stopKeyword) {
                return
            }

            const memberIndex = Math.ceil(i / 2)
            const pairName = `pair${memberIndex}`
            classPairs[pairName].push(response)

            const indexOfClass = classNames.indexOf(response)
            if (indexOfClass !== -1) classNames.splice(indexOfClass, 1);
        }

        const Season = await Guild.getSeasons({
            where: {
                isEnded: false,
                isStarted: false
            }
        })

        if (Season[0]) {
            await Season[0].update({
                classPairs: JSON.stringify(classPairs),
                maxMemberCount: maxMemberCount,
                teamsEnabled: true
            })
        } else {
            await Guild.createSeason({
                classPairs: JSON.stringify(classPairs),
                maxMemberCount: maxMemberCount,
                teamsEnabled: true
            })
        }
    }

    message.channel.send(`Season successfully setup.`)

    /**
* @returns {String}
* @function Gets a response from a user, returns it in a string.
* @param {String} question The question asked to the user.
* @param {Discord.GuildMember} forUser The user for which the question is asked.
* @param {Number} timeLimit The time limit for the question in seconds.
* @param {Discord.TextChannel} channel  The text channel in which the answer is given.
*/

    async function getResponse(question, questionType, forUser, timeLimit, channel) {
        return new Promise(resolve => {
            const filter = message => message.author.id === forUser.id
            const messageCollector = new Discord.MessageCollector(channel, filter, { time: timeLimit * 1000 })
            let response = null

            const questionEmbed = new Discord.MessageEmbed()
                .addField(`Question`, question)
                .setColor(client.color)
            channel.send(questionEmbed)

            messageCollector.on(`collect`, async message => {
                if (message.content.toLowerCase() === stopKeyword) {
                    messageCollector.stop(stopKeyword)
                    return
                }

                if (message.content.length === 0) {
                    await channel.send(`Input is incorrect, try again.`)
                    return
                }

                if (questionType === stringQuestion) {
                    const input = capitalizeFirstLetter(message.content.toLowerCase())
                    if (classNames.includes(input)) {
                        response = input
                        messageCollector.stop()
                    } else {
                        await channel.send(`Cannot find this class in the current available class list, try again.`)
                        return
                    }
                } else if (questionType === booleanQuestion) {
                    if (message.content.toUpperCase() === `YES`) {
                        response = true
                        messageCollector.stop()
                    } else if (message.content.toUpperCase() === `NO`) {
                        response = false
                        messageCollector.stop()
                    } else {
                        await channel.send(`Input is incorrect, try again.`)
                        return
                    }
                } else if (questionType === integerQuestion) {
                    if (Number(message.content) && 0 < Number(message.content) < 100) {
                        response = message.content
                        messageCollector.stop()
                    } else {
                        await channel.send(`Your input has to be between 1 and 100.`)
                    }
                }
            })

            messageCollector.on(`end`, (collected, reason) => {
                if (reason === stopKeyword) {
                    channel.send(`Stopping.`)
                    resolve(stopKeyword)
                } else if (reason === timeReason) {
                    resolve(timeReason)
                } else {
                    resolve(response)
                }
            })
        })
    }
}

module.exports.help = {
    "category": `Season`,
    "commandName": `startSeasonSetup`,
    "example": "`>startSeasonSetup`",
    "explanation": `Starts the season setup.`,
    "isRestricted": true
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}