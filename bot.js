const Discord = require("discord.js");

const Command = require("./commands/command.js");
require('./stringextensions.js');
const CommandHandlers = require ('./commands/commandhandlers.js');
const Reload = require('./commands/reload.js');
const MessageLogger = require("./messagelogger.js");

const commandHandler = CommandHandlers.defaultHandler;
const reloadCommands = Reload.execute;

const CONSOLE_LOGIN = "Logged in as <1>!";
const CONSOLE_ERROR_COMMAND_HANDLER = "Failed to instantiate commandHandler for reason: '<1>'. Exiting."

const client = new Discord.Client();

var fs = require('fs');
const TOKEN = fs.readFileSync('token.txt', 'utf8');

 // process.exit();
 
client.on('ready', () => {
  reloadCommands();
  console.log(CONSOLE_LOGIN.format(client.user.tag));
});

client.on('message', msg => {
  const DISCORD_ERROR_COMMAND_EXECUTE = "Command failed to execute with message: '<1>'";
  
  if (commandHandler.stringHasCommand(msg.content)){
    try{
      var parsedCommand = commandHandler.parseCommandString(msg.content);
      var commandResult = commandHandler.executeParsedCommand(parsedCommand);
      msg.reply(commandResult.message());
    }
    catch(ex){
      msg.reply(DISCORD_ERROR_COMMAND_EXECUTE.format(ex.toString()));
    } 
  }

  MessageLogger.logMessage(msg, false);
 
});

client.login(TOKEN);