const Command = require("./command.js");
const CommandHandlers = require ("./commandhandlers.js");
const Roll = require("./roll.js");
const Attack = require("./attack.js");
const Persuade = require("./persuade.js");
const Help = require("./help.js");
const ListCommands = require("./listcommands");
require("../stringextensions.js");

const commandHandler = CommandHandlers.defaultHandler;

exports.load = function(){
  const ALIAS = "reloadcommands";
  const DESCRIPTION = "reloadcommands" +
    "\nReloads all commands." + 
    "\n\nSample usage: " +
    "\n reloadcommands";
  const PERMISSION_LEVEL = 1;
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

const loadFunctions = [exports.load, Roll.load, Attack.load, Persuade.load, Help.load, ListCommands.load];

exports.execute = function(){
  const MESSAGE = "<1>";
  const SUCCESSFUL_LOAD = "Loaded command '<1>' successfuly!";
  const FAILED_LOAD = "Command '<1>' failed to load! Error message: '<2>'";

  var i;
  var data = "";
  var result;
	
  commandHandler.flushCommands();
  
  for(i = 0; i < loadFunctions.length; ++i){
    var loadFunction = loadFunctions[i];
    var command;
    try{
      command = loadFunction();
      commandHandler.registerCommand(command);
      data += "\n" + SUCCESSFUL_LOAD.format(command.defaultAlias());
    }
    catch(ex){
      data += "\n" + FAILED_LOAD.format(command.defaultAlias(), ex.toString());
    }
    
  }

  var message = MESSAGE.format(data);
  
  return new Command.CommandResult(data, message);
}