const Command = require("./command.js");

const COMMAND_DELIMITER = "!";
exports.defaultHandler = new Command.CommandHandler(COMMAND_DELIMITER);