const Command = require('./command.js');
const CommandHandlers = require ('./commandhandlers.js');
const Roll = require('./roll.js');
require('../stringextensions.js');

const commandHandler = CommandHandlers.defaultHandler;

exports.load = function(){
  const ALIAS = "help";
  const PERMISSION_LEVEL = 1;
  const DESCRIPTION = "help <command>" +
    "\nProvides information on commands. If no command is specified, then general information is provided." + 
    "\n\nSample usage: " +
    "\n help attack";
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

exports.execute = function(args){
  const GENERAL_HELP = "Basic command syntax: <trigger><command> <arg0> <arg1>..." +
    "\nThe arguments are parsed by using spaces. If you wish to pass a string containing spaces, you should use double quotes." +
    "\nCommands may be embedded into one another using curly brackets {}. The result of the embedded command is passed along to the calling command." + 
    "\nExample Usage: attack 6 2 {roll d20}" +
    "\n\nUse help <command> to gain more information about a specific command." +
    "\nUse listcommands to list the names of all commands.";
  var data = "";
  
  if (typeof args[0] == "undefined"){
    var message = GENERAL_HELP;
  }
  else{
    var command = commandHandler.fetchCommand(args[0].arg());
    var message = command.help();
  }

  return new Command.CommandResult(data, message);
}