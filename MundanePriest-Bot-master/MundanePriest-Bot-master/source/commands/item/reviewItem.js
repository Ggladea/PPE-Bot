const Discord = require(`discord.js`)

const token = `secretTokenLanis5671` //also found in all 'botExclusive' commands

const thumbsUpEmoji = `👍`
const waveEmoji = `👋`

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.User} author The guild member that issued the verification process.
 * @param {Discord.Message} message The message that was reacted to.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, author, message, args, isAccepted) => {
    if (args[0] !== token) return

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const ItemSubmissionDispenser = await Guild.getItemSubmissionDispenser()
    const [PendingItemSubmissionPrompt] = await ItemSubmissionDispenser.getPendingItemSubmissionPrompts({ where: { messageId: message.id } })
    const [User] = await Guild.getUsers({ where: { userId: PendingItemSubmissionPrompt.userId } })

    const fieldValue = message.embeds[0].fields[0].value
    const pointRow = fieldValue.split(`\n`)[1]
    const pointValue = Number(pointRow.substring(pointRow.indexOf(`:`) + 1))

    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()
    if (!Season) {
        const noSeasonEmbed = new Discord.MessageEmbed()
            .addField(`Error`, `No season is setup currently.`)
            .setColor(client.color)

        await author.send(noSeasonEmbed)
        return
    }

    const submitter = client.users.get(PendingItemSubmissionPrompt.userId)
    if (isAccepted) {
        const [SubmitterUser] = await Guild.getUsers({ where: { userId: submitter.id } })
 
        if (PendingItemSubmissionPrompt.deathCount === SubmitterUser.deathCount) {
            const acceptedFullPointEmbed = new Discord.MessageEmbed()
                .addField(`Submission Accepted`, `Your submission for **${PendingItemSubmissionPrompt.itemLongName}** has been accepted by: ${author.tag}.\nYou have gained **${pointValue}** points, you now have **${User.points + pointValue}** points.`)
                .setColor(client.color)
            await submitter.send(acceptedFullPointEmbed)

            await User.update({
                points: User.points + pointValue
            })

            await client.database[`ItemLog`].create({
                multiplier: 1,
                itemLongName: PendingItemSubmissionPrompt.itemLongName,
                recipientId: submitter.id,
                seasonIndex: Season.index,
                value: pointValue,
                verifierId: author.id
            })
        } else {
            const acceptedHalfPointEmbed = new Discord.MessageEmbed()
                .addField(`Submission Accepted`, `Your submission for **${PendingItemSubmissionPrompt.itemLongName}** has been accepted by: ${author.tag}.\nYou have gained **${pointValue * 0.5}** points, you now have **${User.points + pointValue * 0.5}** points. This is an **old** submission thus only 50% of the points were granted.`)
                .setColor(client.color)
            await submitter.send(acceptedHalfPointEmbed)

            await User.update({
                points: User.points + pointValue * 0.5
            })

            await client.database[`ItemLog`].create({
                multiplier: 1,
                itemLongName: PendingItemSubmissionPrompt.itemLongName,
                isActive: false,
                recipientId: submitter.id,
                seasonIndex: Season.index,
                value: pointValue,
                verifierId: author.id
            })
        }

        await PendingItemSubmissionPrompt.destroy()

        const oldEmbed = message.embeds[0]
        oldEmbed.setFooter(`User ID: ${User.userId} | Accepted by ${author.tag}`)
        await message.edit(oldEmbed)

        await message.reactions.removeAll()
        await message.react(thumbsUpEmoji)
        if (message.pinned) {
            await message.unpin()
        }
    } else {
        await PendingItemSubmissionPrompt.destroy()

        const oldEmbed = message.embeds[0]
        oldEmbed.setFooter(`User ID: ${User.userId} | Declined by ${author.tag}`)
        await message.edit(oldEmbed)

        await message.reactions.removeAll()
        await message.react(waveEmoji)
        if (message.pinned) {
            await message.unpin()
        }

        const declinedSubmissionEmbed = new Discord.MessageEmbed()
            .addField(`Submission Declined`, `Your submission for **${PendingItemSubmissionPrompt.itemLongName}** has been declined by: ${author.tag}.`)
            .setColor(client.color)

        await submitter.send(declinedSubmissionEmbed)
    }
}

module.exports.help = {
    "category": `botExclusive`,
    "commandName": `reviewItem`,
    "example": ``,
    "explanation": ``,
    "isRestricted": true
}