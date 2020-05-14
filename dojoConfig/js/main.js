// using the class elsewhere...
require([
    "js/Person",
    "dijit/registry", 
    "dojo/parser", 
    "dojo/json", 
    "dojo/_base/config", 
    "dijit/Dialog", 
    "dojo/domReady!"],
  function(Person, registry, parser, JSON, config){
    
    parser.parse();
    console.log("HI THERE");

    var dialog = registry.byId("dialog");
    dialog.set("content", "<pre>" + JSON.stringify(config, null, "\t") + "```");
    dialog.show();

    var person = new Person({name: "Larry", age: 45, residence: "hollywood"});
    console.log(JSON.stringify(person));
    console.log(person);
  });
  