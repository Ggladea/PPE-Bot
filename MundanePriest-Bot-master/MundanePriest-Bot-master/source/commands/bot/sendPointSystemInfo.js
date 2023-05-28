const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const pointSystemEmbed = new Discord.MessageEmbed()
        .setDescription(`**Point System**`)
        .addField(`#1 Items and their Points`,
            `Each item in the game has a value attached to it, all items can be found in the [Item Point Value Spreadsheet](https://docs.google.com/spreadsheets/d/1ZCE330c9gpi6Td0hFAFAzq5VDM79eZVqHzH6koGaGEA/edit#gid=0)
            
To submit items head on over to the <#554883402697015311> channel.`)
        .addBlankField()
        .addField(`#2 Extra Items and Activities`,
`There are certain extra bonuses that give you points. These include but are not limited to:
• Reaching a certain stat level i.e. becoming 4/8 or reaching max Life, Mana.
• Completing a certain amount of dungeons. This also includes soloing hard content.
• Submitting your death fame via <#554883402697015311>.
            
These activites are also considered to be 'Items', you submit them by providing an according ingame screenshot. The names for the these activites can be found in the spreadsheet above.`)
        .addBlankField()
        .addField(`#3 Submission Limitations and Deaths`,
            `You can only submit each item found in the spreadsheet only once per death, if you die you will be able to resubmit them. The death also comes with a downside, you lose **50%** of your points. 
            
To log your death please go to the <#552424345918504980> dispenser and **unreact** to your class and follow the bot's instructions.

If you die and do not decide to make another character, you will keep your points and any bonuses that you had will be applied then and there on death, for this to happen make sure you do **not** unreact to your class choice.`)
        .addBlankField()
        .addField(`#4 Seasons and their Flow`,
            `Each season points reset.
Winners are drawn at the end of the season.`)
        .setColor(client.color)

    await message.channel.send(pointSystemEmbed)
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `sendPointSystemInfo`,
    "example": "`>sendPointSystemInfo`",
    "explanation": `Sends the point system information in the current channel.`,
    "isRestricted": true
}