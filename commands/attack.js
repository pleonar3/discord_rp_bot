const Command = require('./command.js');
require("../mathextensions.js");
const MathJS = require('mathjs');
require('../stringextensions.js');

exports.load = function(){
  const ALIAS = "attack";
  const DESCRIPTION = "attack <perception> <evasion> <damage>" +
    "\nDetermines whether an attack was a hit or a miss, and displays back a damage message." + 
    "\n\nSample usage: " +
    "\n attack 5 5 {roll d10}";
  const PERMISSION_LEVEL = 1;
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

exports.hitThreshold = function(perception, evasion){
  const PERCEPTION_ADJUST = 1.25;
  const EVASION_ADJUST = 0.8;
  const PERCENTAGE_ADJUST = 100;
  perception = perception * PERCEPTION_ADJUST;
  evasion = evasion * EVASION_ADJUST;
  return Math.floor((perception/(perception + evasion)) * PERCENTAGE_ADJUST);
}

exports.execute = function(args){
  const MESSAGE_SUCCESS = "Attack succeeded, dealing <1> damage!";
  const MESSAGE_FAILURE = "Attack missed.";
  const ERROR_ARGUMENT_MISSING = "Argument '<1>' was not supplied!";
  const ERROR_INVALID_NUMBER = "Please supply a valid number for argument '<1>'.";
  const ARGUMENT_PERCEPTION = "perception";
  const ARGUMENT_EVASION = "evasion";
  const ARGUMENT_DAMAGE = "damage";
  const HIT_CHANCE_MINIMUM = 1;
  const HIT_CHANCE_MAXIMUM = 100;
  const RESULT_HIT = "hit";
  const RESULT_MISS = "miss";
  
  if(typeof args[0] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_PERCEPTION);
  }
  
  if(typeof args[1] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_EVASION);
  }
  
  if(typeof args[2] == "undefined"){
    throw ERROR_ARGUMENT_MISSING.format(ARGUMENT_DAMAGE);
  }
  
  var perception = parseInt(args[0].arg());
  var evasion = parseInt(args[1].arg());
  var damage = parseInt(args[2].arg());
  
  if(isNaN(perception)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_PERCEPTION);
  }
  
  if(isNaN(evasion)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_EVASION);
  }
  
  if(isNaN(damage)){
    throw ERROR_INVALID_NUMBER.format(ARGUMENT_DAMAGE);
  }
  
  var hitThreshold = exports.hitThreshold(perception, evasion);
  
  if(Math.RandomInt(HIT_CHANCE_MINIMUM, HIT_CHANCE_MAXIMUM) <= hitThreshold){
    var result = RESULT_HIT;
  }
  else{
    var result = RESULT_MISS;
  }
  
  if (result == RESULT_HIT){
    var message = MESSAGE_SUCCESS.format(damage);
  }
  else if (result == RESULT_MISS){
    var message = MESSAGE_FAILURE;
  }
  
  return new Command.CommandResult(result, message);
}
