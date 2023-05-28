const Discord = require(`discord.js`)

const questionTime = 60 //in seconds
const stopKeyword = `stop`
const moduleType = `verification`

const token = `secretTokenLanis5671` //also found in ReactionHandler
const resumptionToken = `resumedVerificationLanis5671` //also found in ActiveModuleResumptionHandler

const question = [`At any time you can type 'stop' to stop this proccess.\n\nPlease input your **In Game Name**.`]

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.GuildMember} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, message, args) => {
    let characterName
    let DMChannel
    let isResumed = false
    let member

    if (!args) return
    if (args[0] !== token) return
    if (args[1] === resumptionToken) isResumed = true

    const Guild = await client.database[`Guild`].findOne({
        where: {
            guildId: message.guild.id
        }
    })

    const VerificationDispenser = await Guild.getVerificationDispenser()
    let VerificationPrompt = await VerificationDispenser.getVerificationPrompts({ where: { userId: author.id } })

    if (VerificationPrompt.length === 0) {
        await VerificationDispenser.createVerificationPrompt({
            channelId: message.channel.id,
            messageId: message.id,
            userId: author.id
        })

        VerificationPrompt = await VerificationDispenser.getVerificationPrompts({ where: { userId: author.id } })
        member = author
    } else if (VerificationPrompt.length === 1 & isResumed) {
        const guild = client.guilds.get(Guild.guildId)
        member = await guild.members.fetch(VerificationPrompt[0].userId)
        isAlreadyStarted = true
    } else {
        return
    }

    let responseEmbed = new Discord.MessageEmbed().setColor(client.color)

    await handleVerification().then(async callback => {
        const verifiedRole = message.guild.roles.get(Guild.verifiedRoleId)
        if (!verifiedRole) {
            removeFromActiveModules()
            DMChannel.send(`The verified role is not set up, please contact the server owner.`)
            return
        }

        await author.roles.add(verifiedRole).catch(() => {
            DMChannel.send(`Could not give you the verified role, please contact someone who can do it. This could be due to the bot lacking permissions.`)
        })

        if (characterName === message.author.username) {
            const upperCaseCharacterName = capitalizeFirstLetter(character)
            if (capitalizedMemberToVerify !== message.author.username) {
                characterName = upperCaseCharacterName
            } else {
                const lowerCaseCharacterName = lowerCaseFirstLetter(character)
                characterName = lowerCaseCharacterName
            }
        }

        await author.setNickname(`${characterName}`).catch(() => {
            DMChannel.send(`Could not set your nickname, please contact someone who can do it. This could be due to the bot lacking permissions or being below your user's highest role's position in the role list.`)
        })

        responseEmbed.addField(`Success`, callback)

        DMChannel.send(responseEmbed).catch(() => {
            removeFromActiveModules()
        })

        const User = await Guild.getUsers({
            where: {
                userId: member.id
            }
        })

        await User[0].update({
            inGameNameLowerCase: characterName.toLowerCase(),
            inGameNameUnchanged: characterName,
            isVerified: true
        })

        const successfulVerificationEmbed = new Discord.MessageEmbed()
            .setDescription(member.toString())
            .setThumbnail(member.user.displayAvatarURL())
            .addField(`Successful Verification`, `The bot has verified a person named ${characterName}. \n[RealmEye Link](https://www.realmeye.com/player/${characterName})`)
            .setFooter(`User ID: ${member.id}`)
            .setTimestamp()
            .setColor(client.color)

        await logVerificationAction(successfulVerificationEmbed)
    }).catch(async error => {
        responseEmbed.addField(`Failure`, error)

        const failedVerificationEmbed = new Discord.MessageEmbed()
            .setDescription(member.toString())
            .setThumbnail(member.user.displayAvatarURL())
            .addField(`Failed Verification`, `Problem: \n\n` +
                `${error}`)
            .setFooter(`User ID: ${member.id}`)
            .setTimestamp()
            .setColor(client.color)
        await logVerificationAction(failedVerificationEmbed)
        DMChannel.send(responseEmbed).catch(() => {
            removeFromActiveModules()
        })
    })
    removeFromActiveModules()


    async function handleVerification() {
        return new Promise(async (resolve, reject) => {
            DMChannel = await member.createDM().catch(() => {
                reject(`Failed to create the DM Channel.`)
            })

            await getResponse(question, author, questionTime, DMChannel).then(response => {
                if (response !== null) {
                    if (response.toLowerCase() === stopKeyword) {
                        reject('Stopping.')
                        isStopped = true
                    } else {
                        characterName = response
                    }
                } else if (response === null) {
                    reject(`Invalid input, stopping.`)
                    isStopped = true
                }
            })


            if (!characterName) {
                reject('Input was not received, stopping.')
            }

            const axios = require("axios")
            axios.defaults.timeout = 10000
            const cheerio = require("cheerio")
            await axios.get("https://www.realmeye.com/player/" + characterName, { headers: { 'User-Agent': 'RotMG PPE Contests Verification Bot, made by Lanis#9084' } }).then(async response => {
                if (response.status !== 200) {
                    reject(`Error while contacting RealmEye, please try again.`)
                }

                const htmlData = response.data
                const $ = cheerio.load(htmlData)

                const playerName = $('.entity-name').text()
                if (!playerName || playerName.toUpperCase() !== characterName.toUpperCase()) {
                    reject(`Could not find a character with that name, please try again.`)
                }

                let descriptionLines = []
                $('.description-line').each((i, parent) => {
                    const element = parent.children[0]
                    if (element) {
                        descriptionLines.push(element.data)
                    }
                })

                let codeFound = false
                for (const descriptionLine of descriptionLines) {
                    if (descriptionLine.includes(member.id)) {
                        codeFound = true
                    }
                }

                if (!codeFound) {
                    const profileDescription = descriptionLines.length > 0 ? descriptionLines.join(`\n----------------\n\n`) + `\n----------------\n` : `[Empty Description]`
                    const rejectionMessage = `The bot did not find the **Discord Account ID** in your RealmEye Profile, please react again. If the code is already in the description, try again in a few minutes.\n` +
                        `\nThe bot sees your profile with the name **${playerName}**.\n\n` +
                        `**${playerName}'s** description that the bot sees:\n` +
                        "```css\n" +
                        profileDescription +
                        "\n```"
                    reject(rejectionMessage)
                }

                resolve('You have been successfully verified!')
            })
        })
    }

    async function logVerificationAction(embed) {
        return new Promise(async resolve => {
            const logChannel = client.channels.get(Guild.verificationLogChannelId)
            
            if (logChannel) {
                logChannel.send(embed)
            }

            resolve()
        })
    }

    async function removeFromActiveModules() {
        await VerificationPrompt[0].destroy()
    }

    /**
     * @returns {String}
     * @function Gets a response from a user, returns it in a string.
     * @param {String} question The question asked to the user.
     * @param {Discord.GuildMember} forUser The user for which the question is asked.
     * @param {Number} timeLimit The time limit for the question in seconds.
     * @param {Discord.TextChannel} DMChannel  The text DMChannel in which the answer is given.
     */
    async function getResponse(question, forUser, timeLimit, DMChannel) {
        return new Promise(async (resolve) => {
            const filter = message => message.author.id === forUser.id
            const messageCollector = new Discord.MessageCollector(DMChannel, filter, { time: timeLimit * 1000 })
            let response = null

            if (!isResumed) {
                let embed = new Discord.MessageEmbed()
                    .addField(`Verification`, `${question}`)
                    .setColor(client.color)
                await DMChannel.send(embed)
            }

            messageCollector.on(`collect`, async message => {
                if (message.content.toLowerCase() === stopKeyword) {
                    messageCollector.stop(stopKeyword)
                    return
                }

                if (message.content.length === 0) {
                    await DMChannel.send(`Input is incorrect, try again.`)
                    return
                } else {
                    response = message.content
                    messageCollector.stop()
                }
            })

            messageCollector.on(`end`, (collected, reason) => {
                if (reason === stopKeyword) {
                    resolve(stopKeyword)
                } else {
                    resolve(response)
                }
            })
        })
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `verify`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}