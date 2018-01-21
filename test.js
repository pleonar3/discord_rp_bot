function TestA(){
  var me = this;
  
  me.method = function(){
  }
}

function TestB(){
  TestA.call(this);
  var me = this;
  
  me.otherMethod = function(){
  }
}
TestB.prototype = new TestA();

var test = new TestB();

console.log(test);

console.log(test instanceof TestB);
console.log(test instanceof TestA);