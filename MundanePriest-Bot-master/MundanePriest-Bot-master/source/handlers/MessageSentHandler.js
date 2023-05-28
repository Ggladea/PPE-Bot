const Discord = require(`discord.js`)

/** Message Sent Event Handler */
module.exports = class MessageSentHandler {
    /** 
     * Handles the message sent event.
     * @param {Discord.Client} client The client that will handle the message.
     * @param {Discord.Message} message The message that the bot receives.
    */

    async handleMessageSent(client, message) {
        if (message.content === null) return
        if (message.author.bot) return
        if (message.channel.type === "dm") return
        if (!client.isReady) return

        const Guild = await client.database[`Guild`].findOne({
            where: {
                guildId: message.guild.id
            }
        })

        if (!Guild) {
            const DatabaseHandlerModule = require(`./DatabaseHandler`)
            const DatabaseHandler = new DatabaseHandlerModule(client, message.guild)

            if (!DatabaseHandler.isCreated()) {
                DatabaseHandler.createDatabaseEntry()
            }
        }

        //clears all white spacing
        let contentStringified = message.content.match(/\S+/g)
        if (contentStringified === null) return

        let prefix = Guild.prefix ? Guild.prefix : client.prefix
        let command = contentStringified[0]
        if (command.indexOf(prefix) !== 0) return

        const commandFile = client.commands.get(command.slice(prefix.length).toUpperCase())
        if (commandFile) {
            if (client.antiflood.has(message.author.id)) {
                message.reply(`you must wait before sending another command.`)
                return
            }

            if (commandFile.help.isRestricted) {
                const minimumNeededRole = message.guild.roles.get(Guild.minimumBotManageRoleId)
                if (minimumNeededRole && message.member.roles.highest.position < minimumNeededRole.position) {
                    return
                }
            }

            client.antiflood.add(message.author.id)
            setTimeout(() => {
                client.antiflood.delete(message.author.id)
            }, client.antifloodTime * 1000)

            let args = contentStringified.slice(1)
            commandFile.run(client, message, args)
        }
    }
}