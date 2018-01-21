require('../stringextensions.js');

exports.CommandHandler = function(commandDelimiter){
  const ERROR_COMMAND_DELIMITER = "Supplied commandDelimiter isn't a 1-character string!"

  if (typeof commandDelimiter != "string" || commandDelimiter.length != 1){
    throw ERROR_COMMAND_DELIMITER;
  }

	var me = this;
	var commandDelimiter = commandDelimiter;
	var commands = {};
	
	me.registerCommand = function(command){
		const ERROR_ALIAS_EXISTS = "The command wasn't registered because commandAlias '<1>' is already registered!";
    var commandAlias = command.defaultAlias();
    
    if (commands[commandAlias]){
			throw ERROR_ALIAS_EXISTS.format(commandAlias);
		}
		else{
			commands[commandAlias] = command;
		}
	}
	
  me.commandIsRegistered = function(commandString){
    return typeof commands[commandString] != "undefined";
  }
  
  me.fetchCommand = function(commandString){
    const COMMAND_NOT_REGISTERED = "Command '<1>' is not a command!";
    
    if(!me.commandIsRegistered(commandString))
      throw COMMAND_NOT_REGISTERED.format(commandString);
    
    return commands[commandString];
  }
  
  me.commands = function(){
    return Object.keys(commands);
  }
  
	me.flushCommands = function(){
		delete commands;
		commands = {};
	}
	
  me.stringHasCommand = function(string){
    if (typeof string != "string")
      return false;
    
    return string[0] === commandDelimiter;
  }
  
  me.parseCommandString = function(string){
    const ERROR_COMMAND_NOT_EXIST = "Command '<1>' does not exist!";
    
    function extractCommandString(string){
      const EXPECTED_TOKEN = " ";
      
      var result = {};
      var start = 0;
      var end = string.search(EXPECTED_TOKEN);
      
      if (end == -1){
        result.commandString = string;
        result.string = null;
      }
      else{
        result.commandString = string.substring(start, end);
        result.string = string.substring(end, string.length).trim();
      }
      
      return result;
    }
    
    function executeEmbeddedCommands(string){
      const ERROR_EMBEDDED_COMMAND_MISMATCH = "Embedded command mismatch! The openning of an embedded command was declared but not the closing.";
      const ERROR_EMBEDDED_COMMAND_ORPHANED = "Embedded command hanged closing! The closing of an embedded command was found without the associated openning!";
      const ERROR_EMBEDDED_COMMAND_PARSE_FAILURE = "Embedded command couldn't be parsed! Embedded command error message: '<1>'";
      const ERROR_EMBEDDED_COMMAND_EXECUTE_FAILURE = "Embedded command failed to execute! Embedded command error message: '<1>'";
      const ERROR_EMBEDDED_NESTING_DETECTED = "Sorry, nested embedded commands are currently unsupported. Hope to implement in the future!";
      const CHAR_BEGIN = "{";
      const CHAR_END = "}";
      
      while(string.search(CHAR_BEGIN) != -1){
        var embeddedStart = string.search(CHAR_BEGIN);
        var embeddedEnd = string.search(CHAR_END);
        var embeddedCommandString;
        var parsedCommand;
        var embeddedCommandResult;
        
        if (embeddedEnd == -1){
          throw ERROR_EMBEDDED_COMMAND_MISMATCH;
        }
        
        if(embeddedEnd < embeddedStart){
          throw ERROR_EMBEDDED_COMMAND_ORPHANED;
        }
        
        embeddedCommandString = string.substring(embeddedStart + 1, embeddedEnd);
        
        if (embeddedCommandString.search(CHAR_BEGIN) != -1){
          throw ERROR_EMBEDDED_NESTING_DETECTED;
        }
        
        try{
          parsedCommand = me.parseCommandString(embeddedCommandString);
        
        }
        catch(ex){
          throw ERROR_EMBEDDED_COMMAND_PARSE_FAILURE.format(ex.toString());
        }
        
        try{
          embeddedCommandResult = me.executeParsedCommand(parsedCommand);
        }
        catch(ex){
          throw ERROR_EMBEDDED_COMMAND_EXECUTE_FAILURE.format(ex.toString());
        }
        
        string = string.replace(CHAR_BEGIN + embeddedCommandString + CHAR_END, embeddedCommandResult.data());
      }
      
      if (string.search(CHAR_END) != -1){
        throw ERROR_EMBEDDED_COMMAND_ORPHANED;
      }
      
      return string;
    }
    
    function extractCommandArguments(string){
      const ERROR_MISPLACED_STRING_START_CHAR = "Misplaced string start character at token '<1>'.";
      const ERROR_MISPLACED_STRING_END_CHAR = "Misplaced string end character at token '<1>'.";
      const ERROR_MISSING_STRING_CHAR = "Reached end of command string when expecting a string closing character at token '<1>'";
      const CHAR_SPLIT = " ";
      const CHAR_STRING = "\"";
      var tokens = string.split(CHAR_SPLIT);
      var arg;
      var args = [];
      var commandArguments = [];
      var i;
      var stringContext = false;
      
      for(i = 0; i < tokens.length; ++i){
        var token = tokens[i];
        var stringTokenPos = token.search(CHAR_STRING);
        
        //in the context of a string. We're making a concatenation
        if (stringContext){
          //if we find a string char, we need to do something with it
          if(stringTokenPos != -1){
            if (stringTokenPos != token.length - 1){
              throw ERROR_MISPLACED_STRING_END_CHAR.format(token);
            }
            
            token = token.replace(CHAR_STRING, "");
            arg += CHAR_SPLIT + token;
            args.push(arg);
            stringContext = false;
          }
          //otherwise, add it to the combined string
          else{
            if(i == tokens.length - 1){
              throw ERROR_MISSING_STRING_CHAR.format(token);
            }
            
            arg += CHAR_SPLIT + token;
          }
        }
        //not in string context
        else{
          if (stringTokenPos != -1){
            if(stringTokenPos != 0){
              throw ERROR_MISPLACED_STRING_START_CHAR.format(token);
            }
            arg = token.replace(CHAR_STRING, "");
            
            //see if the token has any more string characters
            if(arg.search(CHAR_STRING) != -1){
              //if it does, we need to decide if its an error or just a single word in a set of quotes
              //if its at the end of the token then its not an error
              if(arg.search(CHAR_STRING) == arg.length - 1){
                arg = arg.replace(CHAR_STRING, "");
                args.push(arg);
              }
              //else its an error
              else{
                if(arg.search(CHAR_STRING) != -1){
                  throw ERROR_MISPLACED_STRING_END_CHAR.format(token);
                }
              }
            }
            else{
              stringContext = true;
            }
          }
          else{
            args.push(token)
          }
        }
      }
      
      for(i = 0; i < args.length; ++i){
        commandArguments.push(new exports.CommandArgument(args[i]));
      }
      
      return commandArguments;
    }
    
    string = string.trim();
    string = string.replace(commandDelimiter, "");
    
    var result = extractCommandString(string);
    string = result.string;
    var commandString = result.commandString;
    
    if (string != null){
    
      if (!me.commandIsRegistered(commandString)){
        throw ERROR_COMMAND_NOT_EXIST.format(commandString);
      }
      
      string = executeEmbeddedCommands(string);
      
      var commandArguments = extractCommandArguments(string);
      
      return new exports.ParsedCommand(commandString, commandArguments);
    }
    
    return new exports.ParsedCommand(commandString, []);
  }
  
  me.executeParsedCommand = function(parsed){
    const ERROR_COMMAND_NOT_EXIST = "Command '<1>' does not exist!";
    var commandString = parsed.commandString();
    var args = parsed.args();
    var command;

    command = me.fetchCommand(commandString);
    
    return command.execute(args);
  }
  
	me.commandDelimiter = function(setTo){
    if (typeof setTo == "string")
      commandDelimiter = setTo;
    
		return commandDelimiter;
	}
	
  me.flagDelimiter = function(setTo){
    if (typeof setTo == "string")
      flagDelimiter = setTo;
    
    return flagDelimiter;
  }
  
	return me;
}

exports.ArrayOfCommandArguments = function(array){
	var i;
	
	if (!Array.isArray(array))
		return false;
	
	for(i = 0; i < array.length; ++i){
		if(!(array[i] instanceof exports.CommandArgument)){
			return false;
		}
	}
	
	return true;
}

exports.CommandArgument = function(arg){
  var me = this;
  var arg = arg;
  
  me.arg = function(){
    return arg;
  }
  
  return me;
}

exports.ParsedCommand = function(commandString, args){
  var me = this;
  
  var commandString = commandString;
  var args = args;
  
  me.commandString = function(){
    return commandString;
  }
  
  me.args = function(){
    return args;
  }
  
  return me;
}

exports.CommandResult = function(data, message){
  var me = this;
  
  var data = data;
  var message = message;
  
  me.data = function(){
    return data;
  }
  
  me.message = function(){
    return message;
  }
  
  return me;
}

exports.Command = function(defaultAlias, help, callback, permissionLevel){
  var me = this;
  var permissionLevel = permissionLevel;
  var defaultAlias = defaultAlias;
  var help = help;
  
  me.callback = callback;
  
  me.execute = function(args){
    var commandResult = me.callback(args);
    
    return commandResult;
  }
  
  me.permissionLevel = function(setTo){
    if (typeof setTo == "number")
      permissionLevel = setTo;
    
		return permissionLevel;
	}
  
  me.defaultAlias = function(setTo){
    if (typeof setTo == "number")
      defaultAlias = setTo;
    
		return defaultAlias;
	}
  
  me.help = function(setTo){
    if (typeof setTo == "string")
      help = setTo;
    
    return help;
  }
  
	return me;
}