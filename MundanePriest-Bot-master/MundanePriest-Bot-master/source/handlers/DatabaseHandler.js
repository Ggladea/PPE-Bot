const Discord = require(`discord.js`)

module.exports = class DatabaseHandler {
    /**
     * 
     * @param {Discord.Client} client The client that will be handling the Database.
     * @param {Discord.Guild} guild  The guild that the database has to be handled for.
     */

    constructor(client, guild) {
        this.client = client
        this.guild = guild
    }

    /**
     * @return {boolean} Whether the database entry is created for the specified guild.
     * @function Checks whether the database table for the specified guild exists, if not one is created.
     */

    async isCreated() {
        return new Promise(async resolve => {
            const row = await this.client.database[`Guild`].findOne({ where: { guildId: this.guild.id } })
            if (row) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    }

    /**
     * @return {boolean} Whether the databse entry was successfully created
     * @function Creates a database entry and informs the guild owner of the bot's presence.
     */

    async createDatabaseEntry() {
        return new Promise(async resolve => {
            const row = await this.client.database[`Guild`].findOne({ where: { guildId: this.guild.id } })
            if (row) {
                resolve(false)
                return
            }
            
            await this.client.database[`Guild`].create({
                guildId: this.guild.id,
                prefix: this.client.prefix,
            }).then(() => {
                console.log(`Created Guild Database for ${this.guild.id} (${this.guild.name})`)
                resolve(true)
            })
        })
    }
}