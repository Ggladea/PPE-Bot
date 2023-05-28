const Discord = require(`discord.js`)

const itemSubmissionEmoji = `📬`
/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission(`ADMINISTRATOR`)) {
        message.channel.send(`Sorry, only people with the Administrator permission can create the item submission dispenser.`)
        return
    }

    const Guild = await client.database[`Guild`].findOne({ where: { guildId: message.guild.id } })
    const ItemSubmissionDispenser = await Guild.getItemSubmissionDispenser()

    if (ItemSubmissionDispenser) {
        await message.channel.send(`There was a item submission dispenser set up already, it will not work from now on and now a new dispenser will be set up`)
        await ItemSubmissionDispenser.destroy()
    }

    const channel = client.channels.get(Guild.itemSubmissionDispenserChannelId)

    if (!channel) {
        message.channel.send(`Failed to fetch the item submission dispenser channel, please make sure it's setup correctly.`)
        return
    }

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name} Point Submission Dispenser`, client.user.avatarURL())
        .addField(`Rules for Item Submission`,
            `**#1** You can only submit each **Item** / **Max Stats** / **Dungeon Completes** only once

**#2** When you submit an **Item** screenshot, you must be standing on the bag with it visibly shown

**#3** When submitting a **Max Stats** screenshot, the stat screen alongside the bag must be seen

**#4** When submitting a **Dungeon Complete** screenshot, you must show the screenshot via the in game fame screen

If you meet these conditions, react to ${itemSubmissionEmoji} and follow the steps the bot tells you.

To check the item point values please go to the [Item Point Value Spreadsheet](https://docs.google.com/spreadsheets/d/1ZCE330c9gpi6Td0hFAFAzq5VDM79eZVqHzH6koGaGEA/edit#gid=0)
`)
        .setFooter(`⚠ Please make sure that you don't have DMs turned off.`)
        .setColor(client.color)
    
    const messageSent = await channel.send(embed)
    await messageSent.react(itemSubmissionEmoji)

    await Guild.createItemSubmissionDispenser({
        channelId: channel.id,
        messageId: messageSent.id
    }).then(async () => {
        await message.channel.send(`Done`)
    })
}

module.exports.help = {
    "category": `Item`,
    "commandName": `createItemSubmissionDispenser`,
    "example": "`>createItemSubmissionDispenser`",
    "explanation": `Creates the item submission dispenser.`,
    "isRestricted": true
}