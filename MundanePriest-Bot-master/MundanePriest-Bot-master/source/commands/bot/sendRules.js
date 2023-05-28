/** 
**#4** Tinkerer question
**#5** Quest Chest question
**#6** Backpack question
**#7** Loot drops
**#8 ** Repercussions for cheating
*/


const Discord = require(`discord.js`)

/**
 * @param {Discord.Client} client The client running the command.
 * @param {Discord.Message} message The message that issued the command.
 * @param {Array} args The arguments passed with the command.
 */

module.exports.run = async (client, message, args) => {
    const rulesEmbed = new Discord.MessageEmbed()

        .setDescription(`**Server Rules**`)
        .addField(`#1`, `Respect other members of the server; no excessively toxic, racist or vulgar behavior allowed.`)
        .addField(`#2`, ` NSFW or sexual content is not allowed in any part of this server.`)
        .addField(`#3`, `Do not advertise or discuss  any other discord servers unless they are in <#550833614766735381>.`)
        .addField(`#4`, `Do not spam any text channels or voice channels.`)
        .addField(`#5`, `Only ping / message staff members if you have an actual problem or inquiry. Trolling will result in a mute.`)
        .addField(`#6`, `Keep discussions in their respective channel and please keep discussions limited to English only.`)
        .addField(`#7`, `If you have any issues with other players' conduct, message a Moderator.`)
        .addField(`#8`, `Do not hold any discussion about any third party clients or hacked clients for any game.`)
        .setColor(client.color)

    await message.channel.send(rulesEmbed)

    const ppeRulesEmbed = new Discord.MessageEmbed()
        .setDescription(`**PPE Contest Rules**`)
        .addField(`#1`, `You are not allowed to use items you receive from trade or obtain on other characters. Any old tops and above used you must be able to provide proof of the drop (T11 Weapon, T5 Ability, T12 Armour, T5 Ring).`)
        .addField(`#2`, `Playing on a hacked client is not allowed, if caught you will be given warning and blacklisted from the current season of events.`)
        .addField(`#3`, `Using any items or potions acquired from quest and epic quest chests is not allowed.`)
        .addField(`#4`, `If you choose to compete with a NPE, you must not equip your pet throughout your entire gameplay on that character.`)
        .addField(`#5`, `The character you create for the contest must be created on the day of the contest or a date after that, you are not allowed to start early.`)
        .addField(`#6`, `To earn points for your PPE for item drops, screenshot the item (preferably in the bag) and allow the bag it dropped in to be visible.`)
        .setColor(client.color)

    await message.channel.send(ppeRulesEmbed)
    
    
    const seasonTwoEmbed = new Discord.MessageEmbed()
        .setDescription(`**Season Two Rules**`)
        .addField(`#1`, `You can trade with teammates up until T8 Weapons, T3 Abilities, T9 Armor, and T3 Rings.`)
        .addField(`#2`, `You cannot switch from a team once you have joined.`)
        .addField(`#3`, `You are restricted to these 6 classes: Warrior or Knight, Wizard or Mystic, Ninja or Samurai. A team can only have one class from each group, so doubling up on a class or using a Warrior and Knight is not allowed.`)
        .setColor(client.color)
    await message.channel.send(seasonTwoEmbed)

    const noticeEmbed = new Discord.MessageEmbed()
        .addField(`What is cheating?`, `Cheating is breaking any PPE contest rules, whether it was knowingly or not and on purpose or not. Not knowing the rules is not an excuse.`)
        .setFooter(`Keep in mind that staff will always have the last say.`)
        .setColor(client.color)
    
    await message.channel.send(noticeEmbed)
}

module.exports.help = {
    "category": `Bot`,
    "commandName": `sendRules`,
    "example": "`>sendRules`",
    "explanation": `Sends all the rules to the current channel.`,
    "isRestricted": true
}