const Discord = require(`discord.js`)
const axios = require('axios')

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    let attachmentURL = ''
    for (const attachment of message.attachments.values()) {
        if (attachment.url.endsWith(".csv")) {
            attachmentURL = attachment.url
        }
    }

    if (!attachmentURL) {
        await message.channel.send("No `.csv` file found attached to the message.")
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    await Guild.removeItems()

    await axios.get(attachmentURL, { responseType: "document" }).then(async response => {
        const data = response.data
        const rows = data.split(`\r\n`)

        const firstRow = rows[0].split(`,`)
        let didSkipFirst = false

        let createdItemCount = 0
        for (const itemRow of rows) {
            if (!didSkipFirst) {
                didSkipFirst = true

                continue
            }

            const row = itemRow.split(`,`)
            //Add +1 to index if it has shortname
            let baseIndex = row.length === firstRow.length ? 1 : 0

            if (row.length <= firstRow.length - 2) {
                await message.channel.send(`Failed to read an item from a row as it has too little information, skipping.`)
                continue
            }

            const longName = row[0]
            const shortName = row.length === firstRow.length ? row[1] : null
            const knightValue = row[1 + baseIndex]
            const warriorValue = row[2 + baseIndex]
            const paladinValue = row[3 + baseIndex]
            const assassinValue = row[4 + baseIndex]
            const rogueValue = row[5 + baseIndex]
            const tricksterValue = row[6 + baseIndex]
            const archerValue = row[7 + baseIndex]
            const bardValue = row[8 + baseIndex]
            const huntressValue = row[9 + baseIndex]
            const mysticValue = row[10 + baseIndex]
            const wizardValue = row[11 + baseIndex]
            const necromancerValue = row[12 + baseIndex]
            const ninjaValue = row[13 + baseIndex]
            const kenseiValue = row[14 + baseIndex]
            const samuraiValue = row[15 + baseIndex]
            const priestValue = row[16 + baseIndex]
            const sorcererValue = row[17 + baseIndex]
            const summonerValue = row[18 + baseIndex]

            await Guild.createItem({
                longName: longName,
                shortName: shortName,
                archerValue: archerValue,
                assassinValue: assassinValue,
                huntressValue: huntressValue,
                knightValue: knightValue,
                mysticValue: mysticValue,
                necromancerValue: necromancerValue,
                ninjaValue: ninjaValue,
                paladinValue: paladinValue,
                priestValue: priestValue,
                rogueValue: rogueValue,
                samuraiValue: samuraiValue,
                sorcererValue: sorcererValue,
                tricksterValue: tricksterValue,
                warriorValue: warriorValue,
                wizardValue: wizardValue,
                bardValue: bardValue,
                kenseiValue: kenseiValue,
                summonerValue: summonerValue
            }).then(() => {
                createdItemCount++
            })
        }

        if (createdItemCount > 0) {
            await message.channel.send(`Successfully created ${createdItemCount} items.`)
        } else {
            await message.channel.send(`Could not find a single item to create.`)
            return
        }
    }).catch(error => {
        console.error(error)
    })

    return
}

module.exports.help = {
    "category": `Item`,
    "commandName": `uploadItems`,
    "example": "`>uploadItems <CSV Attachement File>`",
    "explanation": `Updates the bot's database item store with the new values supplied in the CSV file. This file is made by NGL.`,
    "isRestricted": true
}