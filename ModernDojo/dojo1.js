
var nds = dojo.query("div").query("a");
console.log(nds.length);

console.log( dojo.byId("a2") ? true : false);

dojo.create("h1", {innerHTML: "I created this: first"}, dojo.body(), "first");
dojo.create("h1", {innerHTML: "I created this: before"}, dojo.body(), "before");
dojo.create("h1", {innerHTML: "I created this: after"}, dojo.body(), "after");
dojo.create("h1", {innerHTML: "I created this: first"}, dojo.body(), "first");


var p = dojo.query("p")[0]
dojo.attr(p, {onclick: function(){alert("Learning DOJO!")},
			  role: "banner",
			  style: {backgroundColor: "red"}
			 }); 
			 
var navValue = dojo.attr("nav", "id")
console.log("navValue: " + navValue)

var liNodes = dojo.query("li");

var h1Nodes = dojo.query("h1");
//h1Nodes.orphan();

console.log( liNodes.attr("innerHTML") );

console.log( liNodes.attr({className: "highlight"}) );
console.log( liNodes.attr("className") );
console.log( dojo.attr(liNodes[1], "class") );
console.log ( "nav", {style: {backgroundColor: "blue"} } );

var ulnode = dojo.query("ul")[0];
dojo.place(ulnode, p, 'after');

var newul = dojo.clone("nav");
dojo.place(newul, dojo.body(), 'first');

console.log( dojo.map([1,2,3], function(item) { return item * item }) );

liNodes.forEach( function(el, idx, arr) {dojo.attr(el, {style: {color: 'red' }})} );

h1Nodes.connect("onclick", function(e) { console.log("Dojo Click event"); });

dojo.subscribe("MyTopic", function() { console.log("Got MyTopic") });
dojo.publish("MyTopic");

function MyFunc(a) { console.log("OK"); }

