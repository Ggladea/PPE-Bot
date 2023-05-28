const Discord = require(`discord.js`)

const imageQuestion = `image`

const timeLimit = 60
const token = `secretTokenLanis5671` //also found in ReactionHandler
const resumptionToken = `resumedVerificationLanis5671` //also found in ActiveModuleResumptionHandler

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.User} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, guild, message, args) => {
    let isResumed = false
    if (args[0] !== token) return
    if (args[1] === resumptionToken) isResumed = true

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: guild.id } })
    const ItemSubmissionDispenser = await Guild.getItemSubmissionDispenser()
    const [User] = await Guild.getUsers({ where: { userId: author.id } })
    let Item
    const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()

    if (!Season.isStarted) {
        const noSeasonEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No season is currently active.`)
            .setColor(client.color)

        await author.send(noSeasonEmbed)
        return
    }

    if (!User.className) {
        const noClassChosenEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You do not have a class chosen.`)
            .setColor(client.color)

        await author.send(noClassChosenEmbed)
        return
    }

    if (ItemSubmissionPrompt && !isResumed) {
        const alreadyStartedEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `You are already submitting an item.`)
            .setColor(client.color)

        await author.send(alreadyStartedEmbed)
        return
    }

    const submissionQuestion = {
        type: imageQuestion,
        value: `Submit an item name and attach a screenshot.\n\nIf you want to look up item names please go to the [Item Point Value Spreadsheet](https://docs.google.com/spreadsheets/d/1ZCE330c9gpi6Td0hFAFAzq5VDM79eZVqHzH6koGaGEA/edit#gid=0)`
    }
    const submissionMessage = await getResponse(submissionQuestion.value, submissionQuestion.type, author, timeLimit, await author.createDM())
    if (!submissionMessage) {
        const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
        await ItemSubmissionPrompt.destroy()

        const noInputEmbed = new Discord.MessageEmbed()
            .addField(`No Input`, `Not sending item submission.`)
            .setColor(client.color)
        await author.send(noInputEmbed)

        return
    } else {
        const ItemLog = await client.database[`ItemLog`].findOne({ where: { itemLongName: Item.longName, recipientId: author.id, seasonIndex: Season.index, isActive: true } })
        if (ItemLog) {
            const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
            await ItemSubmissionPrompt.destroy()

            const alreadySubmittedEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `You have already submitted a ${Item.longName} screenshot on this character and season.`)
                .setColor(client.color)

            await author.send(alreadySubmittedEmbed)
            return
        }

        const [PendingItemSubmissionPrompt] = await ItemSubmissionDispenser.getPendingItemSubmissionPrompts({ where: { itemLongName: Item.longName, userId: author.id, deathCount: User.deathCount } })
        if (PendingItemSubmissionPrompt) {
            const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
            await ItemSubmissionPrompt.destroy()

            const alreadyInQueueEmbed = new Discord.MessageEmbed()
                .addField(`Error`, `There is already a submission being reviewed for this item.`)
                .setColor(client.color)

            await author.send(alreadyInQueueEmbed)
            return
        }

        if (Item.longName.includes(`Death Fame`)) {
            const Op = client.database.Sequelize.Op

            const ItemLog = await client.database[`ItemLog`].findOne({
                where: {
                    itemLongName: {
                        [Op.like]: '%Death Fame%'
                    },
                    isActive: true,
                    recipientId: author.id,
                    seasonIndex: Season.index
                }
            })

            const [PendingItemSubmissionPrompt] = await ItemSubmissionDispenser.getPendingItemSubmissionPrompts({
                where: {
                    deathCount: User.deathCount,
                    itemLongName: {
                        [Op.like]: '%Death Fame%'
                    },
                    userId: author.id
                }
            })

            if (ItemLog || PendingItemSubmissionPrompt) {
                const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
                await ItemSubmissionPrompt.destroy()

                const alreadySubmittedDeathFameEmbed = new Discord.MessageEmbed()
                    .addField(`Error`, `You already submitted a fame death screenshot for this character or one is in review.`)
                    .setColor(client.color)

                await author.send(alreadySubmittedDeathFameEmbed)
                return
            }
        }

        const itemValue = Item[`${User.className.toLowerCase()}Value`]
        const itemSubmissionEmbed = new Discord.MessageEmbed()
            .setDescription(`**Item Submission** by ${author.toString()}`)
            .addField(`${Item.longName} | ${Item.shortName}`,
                `Class: ${User.className}
Item Point Value: ${itemValue}`)
            .setThumbnail(author.displayAvatarURL())
            .setImage(submissionMessage.attachments.first().url)
            .setFooter(`User ID: ${author.id}`)
            .setTimestamp()
            .setColor(client.color)

        const itemSubmissionsChannel = client.channels.get(Guild.itemSubmissionsChannelId)
        const messageSent = await itemSubmissionsChannel.send(itemSubmissionEmbed)
        await messageSent.react(`🔑`)
        await messageSent.pin().catch(() => { return })

        const systemMesssages = await itemSubmissionsChannel.messages.fetch({ after: messageSent.id }).catch()
        for (let message of systemMesssages.values()) {
            if (message.system) await message.delete().catch()
        }

        await ItemSubmissionDispenser.createPendingItemSubmissionPrompt({
            channelId: itemSubmissionsChannel.id,
            deathCount: User.deathCount,
            messageId: messageSent.id,
            itemLongName: Item.longName,
            isDeath: false,
            userId: author.id
        })

        const [ItemSubmissionPrompt] = await ItemSubmissionDispenser.getItemSubmissionPrompts({ where: { userId: author.id } })
        await ItemSubmissionPrompt.destroy()

        const submissionSentEmbed = new Discord.MessageEmbed()
            .addField(`Success`, `Item submitted successfully.`)
            .setColor(client.color)
        await author.send(submissionSentEmbed)
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
                .addField(`Item Submission`, question)
                .setColor(client.color)

            if (!isResumed) {
                const messageSent = await channel.send(questionEmbed)
                await ItemSubmissionDispenser.createItemSubmissionPrompt({
                    channelId: messageSent.channel.id,
                    messageId: messageSent.id,
                    guildId: guild.id,
                    userId: author.id
                })
            }

            messageCollector.on(`collect`, async responseMessage => {
                if (responseMessage.content.length === 0 && message.attachments.size === 0) {
                    await channel.send(`No item name or image found.`)
                    return
                }

                if (questionType === imageQuestion) {
                    if (!responseMessage.attachments.first()) {
                        await channel.send(`Please add a screenshot and try again.`)
                        return
                    }

                    const attachmentName = responseMessage.attachments.first().name.toUpperCase()
                    const attachmentValid = attachmentName.endsWith(`.PNG`) ||
                        attachmentName.endsWith(`.JPG`) ||
                        attachmentName.endsWith(`.JPEG`)

                    if (!attachmentValid) {
                        await channel.send(`Incorrect file format, try again. Make sure that it's either .jpg, .jpeg or .png`)
                        return
                    }

                    [Item] = await Guild.getItems({
                        where: client.database.Sequelize.where(
                            client.database.Sequelize.fn('upper', client.database.Sequelize.col('longName')),
                            responseMessage.content.toUpperCase()
                        )
                    })

                    if (!Item) {
                        [Item] = await Guild.getItems({
                            where: client.database.Sequelize.where(
                                client.database.Sequelize.fn('upper', client.database.Sequelize.col('shortName')),
                                responseMessage.content.toUpperCase()
                            )
                        })
                    }

                    if (!Item) {
                        await channel.send(`Cannot find the item you requested.`)
                        return
                    }

                    response = responseMessage
                    messageCollector.stop()


                }
            })

            messageCollector.on(`end`, () => {
                resolve(response)
            })
        })
    }

    return
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `submitItem`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}