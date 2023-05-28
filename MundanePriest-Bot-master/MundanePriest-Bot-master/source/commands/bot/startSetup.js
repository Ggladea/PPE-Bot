const Discord = require(`discord.js`)
const DatabaseHandlerModule = require(`../../handlers/DatabaseHandler`)

const clearReason = `clear`
const skipReason = `skip`
const stopKeyword = `stop`
const timeReason = `time`

const stringQuestion = `string`
const textChannelQuestion = `textChannel`
const roleQuestion = `role`
const booleanQuestion = `boolean`

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    /**
     * @param {String} moduleType Describes what type the module is.
     * @param {Discord.Guild} guild The guild that the command is being ran in.
     * @param {Discord.TextChannel} channel The text channel that the text command was ran in.
     * @param {Number} timeLimit The time limit for the module in seconds
     * @param {Number} timeLeft The time left for the module in seconds
     */
    const standardPrefix = client.prefix
    const timeLimit = 60 //seconds

    let isAlreadyStarted = false
    let guild //Identifier
    let channel //Where to restart if needed
    let member //Who to address 

    const Guild = await client.database[`Guild`].findOne({
        where: {
            guildID: message.guild.id
        }
    })

    let GuildSetupPrompt = await Guild.getGuildSetupPrompt()

    if (!GuildSetupPrompt) {
        await Guild.createGuildSetupPrompt({
            channelId: message.channel.id,
            messageId: message.id,
            userId: message.author.id
        })

        guild = message.guild
        channel = message.channel
        member = message.member
    } else {
        guild = client.guilds.get(Guild.guildId)
        channel = client.channels.get(GuildSetupPrompt.channelId)
        member = await guild.members.fetch(GuildSetupPrompt.userId)
        isAlreadyStarted = true
    }

    GuildSetupPrompt = await Guild.getGuildSetupPrompt()

    if (isAlreadyStarted && !GuildSetupPrompt) { //not current message, command was started manually
        member.send(`Sorry there can't be more than 1 setup active at a time in a guild.`)
        return
    } else if (isAlreadyStarted) { //current message, command was restarted, thus same message as the message was fetched
        channel.send(`Hey! It seems like the bot had some troubles and restarted, we will have to start over again, sorry for any inconveniences.`)
    }

    if (!member.hasPermission(`ADMINISTRATOR`)) {
        channel.send(`Sorry, only people with the Administrator permission can manage my setup.`)
        await GuildSetupPrompt.destroy()
        return
    }

    const DatabaseHandler = new DatabaseHandlerModule(client, guild)
    await DatabaseHandler.isCreated().then(async exists => {
        if (!exists) {
            channel.send(`Guild's database does not exist, creating.`)
            await DatabaseHandler.createDatabaseEntry()
        }
    })

    const questionPairs = [
        ['At any time you can type these things:\n`skip` to skip the current question and leave the old value\n`clear` to clear the value to its default state\n`stop` to stop the setup\n\n**Input the minimum role a user has to have to manage the bot and use management functionality.**', roleQuestion],
        [`Input your wanted Prefix.`, stringQuestion],
        [`Input your Class Assignment Channel`, textChannelQuestion],
        [`Input your Item Submission Channel`, textChannelQuestion],
        [`Input your Item Preview Channel`, textChannelQuestion],
        [`Input your Team Creation Channel`, textChannelQuestion],
        [`Input your Verification Dispenser Channel.`, textChannelQuestion],
        [`Input your Verification Log Channel.`, textChannelQuestion],
        [`Input your Verified Role`, roleQuestion]
    ]

    const answers = []
    for (const pair of questionPairs) {
        const question = pair[0]
        const typeOfQuestion = pair[1]
        let isAborted = false

        await getResponse(question, typeOfQuestion, member, timeLimit, channel).then(async response => {
            if (response !== null) {
                if (response === stopKeyword) {
                    await GuildSetupPrompt.destroy()
                    isAborted = true
                }
            }

            answers.push(response)
        })

        if (isAborted) {
            return
        }
    }

    const oldData = [Guild.minimumBotManageRoleId, Guild.prefix, Guild.classDispenserChannelId, Guild.itemSubmissionDispenserChannelId, Guild.teamCreationDispenserChannelId, Guild.verificationDispenserChannelId, Guild.verificationLogChannelId, Guild.verifiedRoleId]
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === skipReason) {
            answers[i] = oldData[i]
        } else if (answers[i] === clearReason) {
            if (i === 1) {
                answers[i] = standardPrefix
            } else {
                answers[i] = `NULL`
            }
        } else if (answers[1] === null) {
            answers[1] = standardPrefix
        }
    }

    await Guild.update({
        minimumBotManageRoleId: answers[0],
        prefix: answers[1],
        classDispenserChannelId: answers[2],
        itemSubmissionDispenserChannelId: answers[3],
        itemSubmissionsChannelId: answers[4],
        teamCreationDispenserChannelId: answers[5],
        verificationDispenserChannelId: answers[6],
        verificationLogChannelId: answers[7],
        verifiedRoleId: answers[8]
    }, {
            where: {
                guildID: guild.id
            }
        })

    await GuildSetupPrompt.destroy()
    await channel.send(`We're done! Check out your setup with the setup command.`)

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
                if (message.content.toLowerCase() === skipReason) {
                    messageCollector.stop(skipReason)
                    return
                }

                if (message.content.toLowerCase() === clearReason) {
                    messageCollector.stop(clearReason)
                    return
                }

                if (message.content.toLowerCase() === stopKeyword) {
                    messageCollector.stop(stopKeyword)
                    return
                }

                if (questionType === textChannelQuestion || questionType === roleQuestion) {
                    let target
                    const id = message.content.replace(/[^0-9]/g, '')

                    if (questionType === textChannelQuestion) {
                        target = channel.guild.channels.get(id)
                        if (target === undefined) {
                            target = channel.guild.channels.find(channel => channel.name.toLowerCase() === message.content.toLowerCase())
                        }
                    } else if (questionType === roleQuestion) {
                        target = channel.guild.roles.get(id)
                        if (target === undefined) {
                            target = channel.guild.roles.find(role => role.name.toLowerCase() === message.content.toLowerCase())
                        }
                    }

                    if (target === undefined) {
                        await channel.send(`Input is incorrect, try again.`)
                    } else {
                        await channel.send(`${target.toString()} is your input, continuing.`)
                        response = target.id
                        messageCollector.stop()
                    }
                } else if (questionType === stringQuestion) {
                    if (message.content.length === 0) {
                        await channel.send(`Input is incorrect, try again.`)
                        return
                    }

                    if (message.content.length > 2) {
                        response = message.content.substring(0, 2)
                        await channel.send(`${response} is now your prefix (the max length for a prefix is 2), continuing.`)
                    } else {
                        response = message.content
                        await channel.send(`${response} is now your prefix, continuing.`)
                    }

                    messageCollector.stop()
                } else if (questionType === booleanQuestion) {
                    if (message.content.length === 0) {
                        await channel.send(`Input is incorrect, try again.`)
                        return
                    }

                    if (message.content.toUpperCase() === `YES`) {
                        response = 1
                        messageCollector.stop()
                    } else if (message.content.toUpperCase() === `NO`) {
                        response = 0
                        messageCollector.stop()
                    } else {
                        await channel.send(`Input is incorrect, try again.`)
                    }
                }
            })

            messageCollector.on(`end`, (collected, reason) => {
                if (reason === skipReason) {
                    channel.send(`Skipping..`)
                    resolve(skipReason)
                } else if (reason === clearReason) {
                    channel.send(`Cleared value.`)
                    resolve(clearReason)
                } else if (reason === stopKeyword) {
                    channel.send(`Stopping.`)
                    resolve(stopKeyword)
                } else if (reason === timeReason) {
                    channel.send(`No input, keeping old value.`)
                    resolve(skipReason)
                } else [
                    resolve(response)
                ]
            })
        })
    }
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `startSetup`,
    "example": ">startSetup",
    "explanation": "Starts the setup for the bot.",
    "isRestricted": true
}