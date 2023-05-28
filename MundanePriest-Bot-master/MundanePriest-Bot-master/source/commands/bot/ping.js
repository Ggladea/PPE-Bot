const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    let responseEmbed = new Discord.MessageEmbed()
        .addField(`Pong!`,
            `I am alive!\n` +
            `This means that I am not offline.\n` +
            `${new Date().getTime() - message.createdTimestamp}` + ` ms`)
        .setColor(client.color)
        .setTimestamp()

    message.channel.send(responseEmbed)
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `ping`,
    "example": "`>ping`",
    "explanation": `Checks the current ping for the bot, tests if it is online.`,
    "isRestricted": true
}