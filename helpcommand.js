const Discord = require("discord.js");
const config = require("./config.json")

module.exports.command = (command, description) => {
    return "**`" + config.prefix + command + "`** - " + description + "\n";
}
