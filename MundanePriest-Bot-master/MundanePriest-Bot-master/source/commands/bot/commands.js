const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
    const botExclusiveCategoryName = `botExclusive`
    let command
    if (args.length > 0) {
        command = args[0].toUpperCase();
    } else {
        command = "ALL"
    }

    let commandsEmbed = new Discord.MessageEmbed()
        .setColor(client.color)
        .setFooter("⚠ Capitalization when issuing commands doesn't matter.");

    switch (command) {
        case ("ALL"):
            let categories = []
            let categoriesFound = []
            client.commands.forEach(command => {
                if (!categoriesFound.includes(command.help.category)) {
                    if (command.help.category === botExclusiveCategoryName) return

                    categoriesFound.push(command.help.category)
                    let category = {
                        name: command.help.category,
                        commands: [command.help.commandName]
                    }

                    categories.push(category)
                } else {
                    categories.find(category => category.name == command.help.category).commands.push(command.help.commandName)
                }
            })

            for (const category of categories) {
                let commands = category.commands.join("; ")
                commandsEmbed.addField(category.name, "```css\n" + commands + "\n```")
            }

            commandsEmbed.addBlankField()
            commandsEmbed.addField(`Learn more about a command`, "`>commands [Command Name]` | `>commands startSetup`\n\nThe **Info** category lists the public commands.")
            break

        default:
            if (client.commands.has(command.toUpperCase())) {
                const commandFile = client.commands.get(command.toUpperCase())
                commandsEmbed.addField("Description", commandFile.help.explanation)
                commandsEmbed.addField("Usage", commandFile.help.example)
            } else {
                return await message.channel.send("No such command found, type `>commands` for a full list.");
            }
    }

    await message.channel.send(commandsEmbed);
}

module.exports.help = {
    commandName: "commands",
    category: "Bot",
    example: "`>commands` | `>commands startSetup`",
    explanation: "Lists all loaded commands with no arguments, otherwise attempts to search the list of commands to show an indepth explanation.",
    "isRestricted": false
}