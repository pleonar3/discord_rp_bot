//incomplete, want to create generic parser rather than spaghetti code 
const symbols = {
	"<s>": "Start of string",
	"<d>": "Data Body"
};

exports.Parser = function(nodeTypeSet){
	var me = this;
	
	if(Array.isArray(nodeTypeSet)){
		var nodeTypeSet = nodeTypeSet;
	}
	else{
		var nodeTypeSet = [];
	}
	
	me.parse = function(rawCommandString){
	}
	
	me.flushNodeTypeSet = function(){
		delete nodeTypeSet;
		nodeTypeSet = [];
	}
}

exports.Node = function(){
  var data;
  var parsePattern;
}
