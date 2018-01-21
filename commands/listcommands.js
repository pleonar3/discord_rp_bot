const Command = require('./command.js');
const CommandHandlers = require ('./commandhandlers.js');
const Roll = require('./roll.js');
require('../stringextensions.js');

const commandHandler = CommandHandlers.defaultHandler;

exports.load = function(){
  const ALIAS = "listcommands";
  const PERMISSION_LEVEL = 1;
  const DESCRIPTION = "listcommands" +
    "Lists all available commands.";
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

exports.execute = function(args){
  var data = "";
  var message = "";
  
  var commands = commandHandler.commands();
  message = commands.toString();
  
  return new Command.CommandResult(data, message);
}