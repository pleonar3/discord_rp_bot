const Command = require('./command.js');
require("../mathextensions.js");
const MathJS = require('mathjs');
require('../stringextensions.js');

exports.load = function(){
  const ALIAS = "roll";
  const PERMISSION_LEVEL = 1;
  const DESCRIPTION = "roll <expression>" +
    "\nRolls a single die or many dice, also performing any requested mathemtical operations." + 
    "\n\nSample usage: " +
    "\n roll (5d20 + d5} * d6 + d5";
  var command = new Command.Command(ALIAS, DESCRIPTION, exports.execute, PERMISSION_LEVEL);
  return command;
}

//to replace/recode after impelmenting general parsing. This is a temporary system to serve immediate purpose.
exports.diceToMath = function(diceString){
  const DIE_CHAR = "d";
  const DIE_ROLL_MINIMUM = 1;
  var i = 0;
  var index0 = diceString.search(DIE_CHAR);

  //reading one char at a time and parsing out the die. replace them with results
  while(index0 != -1){
    var rollMax = "";
    var index1 = index0 + 1;
    var dieLength;
    var diceCount = "";
    var diceCountStrLen = 0;
    var dieString = "";
    var stopSymbol = "() ";
    var check = index0 - 1;

    if(index0 > 0){
      var ch = parseInt(diceString[check]);
      
      while(stopSymbol.search(diceString[check]) == -1 && check >= 0){
        diceCount = ch.toString() + diceCount;
        check = check - 1;
        ch = parseInt(diceString[check]);
        
      }
    }
    
    var diceCountStrLength = diceCount.length;
    diceCount = parseInt(diceCount);

    while(!isNaN(parseInt(diceString[index1]))){
      rollMax += diceString[index1];
      ++index1;
    }
    dieLength = index1 - index0;
    
    dieString += "(";
    for(i = 0; i < diceCount - 1; ++i){
      dieString += (Math.RandomInt(DIE_ROLL_MINIMUM, parseInt(rollMax))).toString() + " + ";
    }
    dieString += (Math.RandomInt(DIE_ROLL_MINIMUM, parseInt(rollMax))).toString();
    dieString += ")";
    
    if(diceCount > 1){
      index0 -= diceCountStrLength;
      dieLength += diceCountStrLength;
    }
    
    diceString = diceString.splice(index0, dieLength, dieString);

    index0 = diceString.search(DIE_CHAR);
  }
  
  return diceString;
}

exports.execute = function(args){
  const MESSAGE = "<1> = <2> = <3>";
  const ERROR = "Math expression couldn't be evaluated. Reason: '<1>'.";
  
  var i;
  var diceString = "";
  
  if (args.length == 1){
    var diceString = args[0].arg();
  }
  else{
    for(i = 0; i < args.length; ++i){
      diceString += args[i].arg() + " ";
    }
  }
  var mathString = exports.diceToMath(diceString);

  console.log(mathString);
  
  try{
    var rolled = MathJS.eval(mathString);
  }
  catch(ex){
    var errorReason = ex;
  }
  
  if(rolled){
    message = MESSAGE.format(diceString, mathString, rolled.toString());
    
    return new Command.CommandResult(rolled, message);
  }
  
  throw ERROR.format(errorReason.toString());
}
