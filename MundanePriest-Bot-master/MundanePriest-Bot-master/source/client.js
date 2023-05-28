const Config = require("../data/config")
const Discord = require(`discord.js`)
const FileSystem = require(`fs`)
const Path = require(`path`)
const Sequelize = require(`sequelize`)

const MessageSentHandlerModule = require(`./handlers/MessageSentHandler`)
const ReactionHandlerModule = require(`./handlers/ReactionHandler`)

const ActiveModuleResumptionModule = require(`./handlers/ActiveModuleResumptionHandler`)
const SweepingModule = require(`./handlers/SweepingHandler`)

module.exports = class Bot {

    /**
     * Creates an instance of Bot.
     * @param {Discord.client} client
     */
    constructor(client) {
        this.client = client;
        this.client.prefix = Config.prefix
        this.client.color = `#6af271`
        this.client.creatorDiscordTag = Config.creatorDiscordTag
        this.client.isReady = false

        this.MessageSentHandler = new MessageSentHandlerModule
        this.ReactionHandler = new ReactionHandlerModule
    }

    async initiate() {
        console.log(`_ _ _ _ _ _ _ _ _ _`)
        //Load core
        await this.loadCommands()
        await this.loadDatabase()
        await this.setupAntiFlood()

        this.client.on(`ready`, async () => {
            console.log(`Client Online\n`)

            //Load dependencies
            await this.sweepModules()
            await this.resumeActiveModules()
            this.client.isReady = true
            this.setPresence()
        })

        this.client.on(`disconnect`, (event) => {
            console.log(`Client has closed with status code ${event.code} and reason ${event.reason}`)
        })

        const events = {
            MESSAGE_REACTION_ADD: 'messageReactionAdd',
            MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
        }

        this.client.on(`guildMemberAdd`, async (guildMember) => {
            const Guild = await this.client.database[`Guild`].findOne({ where: { guildId: guildMember.guild.id } })
            const User = await Guild.getUsers({ where: { userId: guildMember.id } })

            if (User.length === 0) {
                await Guild.createUser({
                    userId: guildMember.id
                })

                console.log(`${guildMember.displayName} joined.`)
            }
        })

        this.client.on(`messageReactionAdd`, (messageReaction, user) => {
            if (messageReaction === undefined) return
            if (messageReaction.message === undefined) return
            if (messageReaction.message.channel.type !== "text" && messageReaction.message.channel.type !== "dm") return
            if (!user) return
            if (user.bot) return

            this.ReactionHandler.handleReaction(this.client, messageReaction, user, true)
        })

        this.client.on(`messageReactionRemove`, (messageReaction, user) => {
            if (messageReaction === undefined) return
            if (messageReaction.message === undefined) return
            if (messageReaction.message.channel.type !== "text" && messageReaction.message.channel.type !== "dm") return
            if (!user) return
            if (user.bot) return

            this.ReactionHandler.handleReaction(this.client, messageReaction, user, false)
        })

        this.client.on(`message`, (message) => {
            this.MessageSentHandler.handleMessageSent(this.client, message)
        })

        this.client.on(`rateLimit`, rateLimitInfo => {
            //console.log(`Rate Limit!\nTimeout - ${rateLimitInfo.timeout} ms\nLimit - ${rateLimitInfo.limit}\nTrigger Method - ${rateLimitInfo.method}\nTrigger Path - ${rateLimitInfo.path}\nTrigger Route - ${rateLimitInfo.route}`)
        })

        this.client.on(`raw`, async event => {
            if (!events.hasOwnProperty(event.t)) return
            const { d: data } = event

            const user = this.client.users.get(data.user_id)
            const channel = this.client.channels.get(data.channel_id)

            if (channel === undefined) return
            if (channel.messages.has(data.message_id)) return

            const message = await channel.messages.fetch(data.message_id).catch()
            const emojiKey = data.emoji.id || data.emoji.name
            const reaction = message.reactions.get(emojiKey)

            this.client.emit(events[event.t], reaction, user)
        })
    }

    async loadCommands() {
        return new Promise(async resolve => {
            this.client.commands = new Discord.Collection()

            const walkSync = (dir, filelist = []) => FileSystem.readdirSync(dir)
                .map(file => FileSystem.statSync(Path.join(dir, file)).isDirectory()
                    ? walkSync(Path.join(dir, file), filelist)
                    : filelist.concat(Path.join(dir, file))[0])

            const files = walkSync(`./commands`)
            const filteredFiles = files.flat().filter(filePath => filePath.split(`.`).pop() === `js`)
 
            if (filteredFiles.length <= 0) {
                console.log(`Command folder not found or zero length (empty)`);
                return;
            }

            filteredFiles.forEach((filePath, i) => {
                const file = require(`./${filePath}`);
                this.client.commands.set(file.help.commandName.toUpperCase(), file);
            });

            console.log(`Loaded ${this.client.commands.size} / ${filteredFiles.length} commands.`)

            resolve()
        })
    }

    async loadDatabase() {
        return new Promise(async resolve => {
            const database = {}

            const sequelize = new Sequelize({
                dialect: `sqlite`,
                logging: false,
                storage: `../data/database`
            })

            FileSystem.readdir(`../data/models`, async (error, files) => {
                if (error) console.log(error)

                //JavaSript files only
                let filteredFiles = files.filter(filePath => filePath.split(`.`).pop() === `js`)

                if (filteredFiles.length <= 0) {
                    console.log(`Models folder not found or zero length (empty)`)
                    return
                }

                filteredFiles.forEach((f, i) => {
                    const model = sequelize.import(`../data/models/${f}`)

                    database[model.name] = model
                })

                let associationCount = 0
                for (const model in database) {
                    if (database[model].associate) {
                        associationCount++
                        database[model].associate(database)
                    }
                }

                database.Sequelize = Sequelize
                database.sequelize = sequelize
                await database.sequelize.sync()

                this.client.database = database

                //Remove 2 due to Sequelize and sequelize being added alongside the models.
                console.log(`Loaded ${Object.keys(database).length - 2} / ${filteredFiles.length} models with ${associationCount} associations.`)
                console.log(`SQLite3 Database Loaded.`)
                resolve()
            })
        })
    }

    async resumeActiveModules() {
        return new Promise(async resolve => {
            await new ActiveModuleResumptionModule(this.client).resumeModules()
            resolve()
        })
    }

    setPresence() {
        this.client.user.setPresence({ activity: { name: 'Running & Stealing Points' }, status: 'online' })
    }

    async sweepModules() {
        return new Promise(async resolve => {
            await new SweepingModule(this.client).sweep()
            resolve()
        })
    }

    setupAntiFlood() {
        return new Promise(async resolve => {
            this.client.antiflood = new Set()
            this.client.antifloodTime = 3  // in seconds
            resolve()
        })
    }
}
//Check out collectors dispose option.