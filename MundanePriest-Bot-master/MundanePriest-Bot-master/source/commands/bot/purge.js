const Discord = require(`discord.js`)


/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const messageNumber = parseInt(args[0]) + 1;

    if (!messageNumber) return;
    if (messageNumber > 100) return await message.channel.send("Can't delete more than 100 messages at a time, including yours.");
    
    await message.channel.bulkDelete(messageNumber).catch(() => { })
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `purge`,
    "example": "`>purge 5`",
    "explanation": `A purge command that can be used by the staff.`,
    "isRestricted": true
}