const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
   message.channel.send("See the `commands` command.")
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `help`,
    "example": "`>help`",
    "explanation": `Redirects the user to the commands list.`,
    "isRestricted": false
}