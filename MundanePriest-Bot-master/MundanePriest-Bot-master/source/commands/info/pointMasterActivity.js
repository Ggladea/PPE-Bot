const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const Seasons = await Guild.getSeasons()
    const Season = Seasons.pop()
    const ItemLogs = await client.database[`ItemLog`].findAll({ where: { seasonIndex: Season.index } })
 
    const verifiers = []
    for (const ItemLog of ItemLogs) {
        let isVerifierFound = false
        for (let i = 0; i < verifiers.length; i++) {
            if (verifiers[i].userId === ItemLog.verifierId) {
                isVerifierFound = true
                verifiers[i].verificationCount += 1
                
                break
            }
        }

        if (!isVerifierFound) {
            const verifier = {
                userId: ItemLog.verifierId,
                verificationCount: 1
            }

            verifiers.push(verifier)
        }
    }

    verifiers.sort(compare)

    let embedString = ``
    for (let i = 0; i < verifiers.length; i++) {
        const verifier = verifiers[i]
        const user = client.users.get(verifier.userId)
        if (user) {
            embedString += `**[#${i + 1}]** ${user.tag} | ${verifier.verificationCount}\n`
        } else {
            embedString += `**[#${i + 1}]** User Not Found | ${verifier.verificationCount}\n`
        }
    }

    if (embedString.length === 0) {
        embedString = `No items have been accepted this season.`
    }

    const verifiersEmbed = new Discord.MessageEmbed()
        .addField(`Point Master Activity`, embedString)
        .setColor(client.color)
    .setFooter(`All Point Masters not displayed here have not done a single verification.`)
    await message.channel.send(verifiersEmbed)
}

function compare(lhs, rhs) {
    return rhs.verificationCount - lhs.verificationCount
}

module.exports.help = {
    "category": `Info`,
    "commandName": `pointMasterActivity`,
    "example": "`>pointMasterActivity`",
    "explanation": `Shows point master activity for the current season.`,
    "isRestricted": true
}