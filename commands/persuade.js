const Command = require('./command.js');
require("../mathextensions.js");
const MathJS = require('mathjs');
require('../stringextensions.js');

exports.load = function(){
  const ALIAS = "persuade";
  const DESCRIPTION = "persuade <persuader's persuassion> <target's persuassion> <skill die bonus>" +
    "\nDetermines the success or failure of persuassion." + 
    "\n\nSample usage: " +
    "\n persuade 5 5 3";
  const PERMISSION_LEVEL = 1;
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

exports.persuassionThreshold = function(persuadersPersuassion, targetsPersuassion, percentageBonus){
  const PERCENTAGE_ADJUST = 100;
  return Math.floor((persuadersPersuassion/(persuadersPersuassion + targetsPersuassion)) * PERCENTAGE_ADJUST) + percentageBonus;
}

exports.execute = function(args){
  const MESSAGE_SUCCESS = "You managed to persuade the target.";
  const MESSAGE_FAILURE = "You failed to persuade the target.";
  const ERROR_ARGUMENT_MISSING = "Argument '<1>' was not supplied!";
  const ERROR_INVALID_NUMBER = "Please supply a valid number for argument '<1>'.";
  const ARGUMENT_PERSUADER = "persuader's persuassion";
  const ARGUMENT_TARGET = "target's persuassion";
  const ARGUMENT_SKILL_DIE_BONUS = "skill die bonus";
  const PERSUASSION_CHANCE_MINIMUM = 1;
  const PERSUASSION_CHANCE_MAXIMUM = 100;
  const RESULT_HIT = "persuaded";
  const RESULT_MISS = "failed";
  
  if(typeof args[0] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_PERSUADER);
  }
  
  if(typeof args[1] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_TARGET);
  }
  
  if(typeof args[2] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_SKILL_DIE_BONUS);
  }
  
  var persuader = parseInt(args[0].arg());
  var target = parseInt(args[1].arg());
  var dieBonus = parseInt(args[2].arg());
  
  if(isNaN(persuader)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_PERSUADER);
  }
  
  if(isNaN(target)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_TARGET);
  }
  
  if(isNaN(dieBonus)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_SKILL_DIE_BONUS);
  }
  
  var persuassionThreshold = exports.persuassionThreshold(persuader, target, dieBonus);
  
  if(Math.RandomInt(PERSUASSION_CHANCE_MINIMUM, PERSUASSION_CHANCE_MAXIMUM) <= persuassionThreshold){
    var result = RESULT_HIT;
  }
  else{
    var result = RESULT_MISS;
  }
  
  if (result == RESULT_HIT){
    var message = MESSAGE_SUCCESS;
  }
  else if (result == RESULT_MISS){
    var message = MESSAGE_FAILURE;
  }
  
  return new Command.CommandResult(result, message);
}
