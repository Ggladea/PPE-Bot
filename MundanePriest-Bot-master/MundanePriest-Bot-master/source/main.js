const Discord =  require(`discord.js`)
const Config = require(`../data/config`)
const Bot = require(`./client`)

const client = new Discord.Client({ restTimeOffset: 0 })
new Bot(client).initiate()

client.login(Config.token)