// using the class elsewhere...
require(["js/Person"], function(Person){
    var anon  = new Person(),
        alice = new Person({ name: "Alice", age: 42, residence: "Universe 1" });
  
    console.log(anon.name, alice.name); // "Anonymous", "Alice"
    console.log(anon.residence, alice.residence); // "Universe A", "Universe 1"
    alice.moveTo("Universe 420");
    console.log(alice.residence); // "Universe 420"
  });
  